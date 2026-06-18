from datetime import datetime

from pydantic import BaseModel, Field


class SendMessageRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=4000)


class ChatSessionResponse(BaseModel):
    id: str
    student_id: int
    title: str | None
    created_at: datetime
    updated_at: datetime


class LLMMetadata(BaseModel):
    """Flexible metadata from the LLM provider."""

    model: str
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    total_tokens: int | None = None
    response_time_ms: int | None = None

    model_config = {'extra': 'allow'}


class ChatMessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    llm_metadata: LLMMetadata | None
    created_at: datetime
    updated_at: datetime
