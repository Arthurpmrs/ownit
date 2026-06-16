import asyncio
import time

from haystack.components.generators.chat import OpenAIChatGenerator
from haystack.dataclasses import ChatMessage, StreamingChunk
from haystack.utils import Secret

from src.core.config import get_settings
from src.core.db import get_engine
from src.core.logger import get_logger
from src.features.chat import service
from src.features.chat.prompts import SYSTEM_PROMPT

logger = get_logger(__name__)


def create_chat_generator(
    streaming_callback=None,
) -> OpenAIChatGenerator:
    settings = get_settings()
    return OpenAIChatGenerator(
        api_key=Secret.from_token(settings.LLM_API_KEY),
        api_base_url=settings.LLM_BASE_URL,
        model=settings.LLM_MODEL,
        streaming_callback=streaming_callback,
        generation_kwargs={
            'max_tokens': settings.LLM_MAX_TOKENS,
            'temperature': settings.LLM_TEMPERATURE,
        },
    )


def build_haystack_messages(
    history: list[dict[str, str]],
) -> list[ChatMessage]:
    """Convert DB history to Haystack ChatMessage objects."""
    messages = [ChatMessage.from_system(SYSTEM_PROMPT)]
    for msg in history:
        if msg['role'] == 'user':
            messages.append(ChatMessage.from_user(msg['content']))
        elif msg['role'] == 'assistant':
            messages.append(ChatMessage.from_assistant(msg['content']))
    return messages


class ChunkCollector:
    """Bridges Haystack's sync streaming_callback to async SSE.

    Accumulates the full response in a buffer so persistence
    can happen independently of the SSE client connection.
    """

    def __init__(self, loop: asyncio.AbstractEventLoop):
        self.queue: asyncio.Queue = asyncio.Queue()
        self.loop = loop
        self.content_buffer: list[str] = []

    def callback(self, chunk: StreamingChunk) -> None:
        """Called by Haystack on each token — thread-safe."""
        if chunk.content:
            self.content_buffer.append(chunk.content)
            self.loop.call_soon_threadsafe(
                self.queue.put_nowait,
                {'type': 'token', 'content': chunk.content},
            )

    def put_done(self, data: dict) -> None:
        self.loop.call_soon_threadsafe(
            self.queue.put_nowait,
            {'type': 'done', 'data': data},
        )

    def put_error(self, detail: str) -> None:
        self.loop.call_soon_threadsafe(
            self.queue.put_nowait,
            {'type': 'error', 'detail': detail},
        )

    def finish(self) -> None:
        self.loop.call_soon_threadsafe(self.queue.put_nowait, None)

    @property
    def full_content(self) -> str:
        return ''.join(self.content_buffer)

    async def stream(self):
        """Yields queue items until sentinel (None)."""
        while True:
            item = await self.queue.get()
            if item is None:
                break
            yield item


async def run_pipeline_and_persist(
    session_id: str,
    messages: list[ChatMessage],
    collector: ChunkCollector,
) -> None:
    """Run the LLM pipeline and persist the result.

    Runs to completion regardless of SSE client state.
    The pipeline thread accumulates tokens in the collector's
    buffer, then persists the full response with its own
    database connection.
    """
    settings = get_settings()
    generator = create_chat_generator(streaming_callback=collector.callback)

    start_time = time.monotonic()
    try:
        result = await asyncio.to_thread(generator.run, messages=messages)
        elapsed_ms = int((time.monotonic() - start_time) * 1000)

        reply = result['replies'][0]
        usage = reply.meta.get('usage', {})
        llm_metadata = {
            'model': reply.meta.get('model', settings.LLM_MODEL),
            'prompt_tokens': usage.get('prompt_tokens'),
            'completion_tokens': usage.get('completion_tokens'),
            'total_tokens': usage.get('total_tokens'),
            'response_time_ms': elapsed_ms,
        }

        # Persist with an independent connection
        with get_engine().begin() as conn:
            msg = service.save_assistant_message(
                conn,
                session_id,
                content=collector.full_content,
                llm_metadata=llm_metadata,
            )

        collector.put_done({
            'message_id': str(msg.id),
            'llm_metadata': llm_metadata,
        })
        logger.info(
            f'Pipeline completed for session={session_id}, '
            f'tokens={usage.get("total_tokens")}, '
            f'time={elapsed_ms}ms'
        )
    except Exception as e:
        logger.exception(f'LLM pipeline failed for session={session_id}')
        collector.put_error(str(e))
    finally:
        collector.finish()
