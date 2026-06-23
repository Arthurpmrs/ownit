from functools import lru_cache

import tiktoken
from haystack import Document, Pipeline, component
from haystack.components.embedders import OpenAITextEmbedder
from haystack.utils import Secret
from haystack_integrations.components.retrievers.pgvector import (
    PgvectorEmbeddingRetriever,
)
from haystack_integrations.document_stores.pgvector import PgvectorDocumentStore

from src.core.config import get_settings
from src.core.db import get_pgvector_url
from src.core.logger import get_logger
from src.features.chat.prompts import CONTEXT_PROMPT_TEMPLATE

logger = get_logger(__name__)


@component
class ContextFilter:
    def __init__(self, similarity_threshold: float, max_tokens: int):
        self.similarity_threshold = similarity_threshold
        self.max_tokens = max_tokens
        self.encoding = tiktoken.get_encoding('cl100k_base')

    @component.output_types(documents=list[Document])
    def run(self, documents: list[Document]):
        filtered_docs = [
            doc
            for doc in documents
            if doc.score is not None and doc.score >= self.similarity_threshold
        ]

        filtered_docs.sort(key=lambda d: d.score or 0.0, reverse=True)

        selected_docs = []
        accumulated_tokens = 0

        for doc in filtered_docs:
            content = doc.content or ''
            tokens = len(self.encoding.encode(content))
            if accumulated_tokens + tokens > self.max_tokens:
                break
            selected_docs.append(doc)
            accumulated_tokens += tokens

        return {'documents': selected_docs}


@lru_cache()
def get_rag_pipeline() -> Pipeline:
    settings = get_settings()
    db_url = get_pgvector_url()

    document_store = PgvectorDocumentStore(
        connection_string=Secret.from_token(db_url),
        table_name='user_guide_documents',
        embedding_dimension=settings.EMBEDDING_DIMENSION,
        vector_function='cosine_similarity',
    )

    embedder = OpenAITextEmbedder(
        api_key=Secret.from_token(settings.EMBEDDING_API_KEY),
        api_base_url=settings.EMBEDDING_BASE_URL,
        model=settings.EMBEDDING_MODEL,
        dimensions=settings.EMBEDDING_DIMENSION,
    )

    retriever = PgvectorEmbeddingRetriever(
        document_store=document_store,
        top_k=settings.RAG_TOP_K,
        vector_function='cosine_similarity',
    )

    context_filter = ContextFilter(
        similarity_threshold=settings.RAG_SIMILARITY_THRESHOLD,
        max_tokens=settings.RAG_MAX_CONTEXT_TOKENS,
    )

    pipeline = Pipeline()
    pipeline.add_component('embedder', embedder)
    pipeline.add_component('retriever', retriever)
    pipeline.add_component('filter', context_filter)

    pipeline.connect('embedder.embedding', 'retriever.query_embedding')
    pipeline.connect('retriever.documents', 'filter.documents')

    return pipeline


def retrieve_context(query: str, pipeline: Pipeline) -> list[Document]:
    """Retrieve relevant chunks from pgvector using the RAG pipeline."""
    logger.debug("Retrieving context for query: '%s'", query)
    result = pipeline.run({'embedder': {'text': query}})
    documents = result['filter']['documents']

    logger.debug('Retrieved %d documents for context.', len(documents))
    for i, doc in enumerate(documents):
        source_file = doc.meta.get('source_file', 'unknown')
        section = doc.meta.get('section', '')
        score = doc.score if doc.score is not None else 0.0
        logger.debug(
            'Doc %d: score=%.4f, source=%s, section=%s',
            i + 1,
            score,
            source_file,
            section,
        )

    return documents


def format_context(documents: list[Document]) -> str:
    """Format retrieved chunks into a system prompt context block."""
    if not documents:
        return ''

    docs_str_list = []
    for doc in documents:
        source_file = doc.meta.get('source_file', 'unknown')
        section = doc.meta.get('section', '')
        source_str = f'[Fonte: {source_file}'
        if section:
            source_str += f' > {section}'
        source_str += ']'
        docs_str_list.append(f'{source_str}\n{doc.content or ""}\n---')

    context_documents = '\n'.join(docs_str_list)
    return CONTEXT_PROMPT_TEMPLATE.format(context_documents=context_documents)
