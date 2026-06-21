from haystack import Document
from haystack.components.embedders import OpenAITextEmbedder
from haystack.utils import Secret
from haystack_integrations.components.retrievers.pgvector import PgvectorEmbeddingRetriever
from haystack_integrations.document_stores.pgvector import PgvectorDocumentStore

from src.core.config import get_settings
from src.core.db import get_pgvector_url
from src.features.chat.prompts import CONTEXT_PROMPT_TEMPLATE


def retrieve_context(query: str) -> list[Document]:
    """Retrieve relevant chunks from pgvector based on query vector similarity."""
    settings = get_settings()

    # Initialize pgvector document store
    db_url = get_pgvector_url()

    document_store = PgvectorDocumentStore(
        connection_string=Secret.from_token(db_url),
        table_name='user_guide_documents',
        embedding_dimension=settings.EMBEDDING_DIMENSION,
        vector_function='cosine_similarity',
    )

    # Initialize embedder for query text
    embedder = OpenAITextEmbedder(
        api_key=Secret.from_token(settings.EMBEDDING_API_KEY),
        api_base_url=settings.EMBEDDING_BASE_URL,
        model=settings.EMBEDDING_MODEL,
        dimensions=settings.EMBEDDING_DIMENSION,
    )

    # Embed the query
    embedded_query = embedder.run(text=query)['embedding']

    # Initialize retriever
    retriever = PgvectorEmbeddingRetriever(
        document_store=document_store,
        top_k=settings.RAG_TOP_K,
        vector_function='cosine_similarity',
    )

    # Retrieve docs
    results = retriever.run(query_embedding=embedded_query)['documents']

    # Filter by similarity threshold
    filtered_docs = [
        doc for doc in results
        if doc.score is not None and doc.score >= settings.RAG_SIMILARITY_THRESHOLD
    ]

    # Sort by score descending (highest similarity first)
    filtered_docs.sort(key=lambda d: d.score or 0.0, reverse=True)

    # Accumulate chunks under RAG_MAX_CONTEXT_TOKENS limit (approx 4 chars per token)
    selected_docs = []
    accumulated_tokens = 0
    max_tokens = settings.RAG_MAX_CONTEXT_TOKENS

    for doc in filtered_docs:
        content_len = len(doc.content or '')
        estimated_tokens = content_len / 4.0
        if accumulated_tokens + estimated_tokens > max_tokens:
            break
        selected_docs.append(doc)
        accumulated_tokens += estimated_tokens

    return selected_docs


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
        docs_str_list.append(f"{source_str}\n{doc.content or ''}\n---")

    context_documents = '\n'.join(docs_str_list)
    return CONTEXT_PROMPT_TEMPLATE.format(context_documents=context_documents)
