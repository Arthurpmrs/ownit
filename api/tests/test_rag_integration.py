import json
import pytest
import respx
import httpx
from typing import Any
from haystack.utils import Secret
from haystack import Document
from haystack_integrations.document_stores.pgvector import PgvectorDocumentStore

from tests.conftest import get_test_settings
from scripts.index_user_guide import run_indexing_pipeline, get_pgvector_url
from src.features.chat.retrieval import get_rag_pipeline, retrieve_context

@pytest.fixture
def mock_user_guide(tmp_path):
    user_guide = tmp_path / "user-guide"
    user_guide.mkdir()
    (user_guide / "doc1.md").write_text("# Apple\n\nApples are red.", encoding='utf-8')
    (user_guide / "doc2.md").write_text("# Banana\n\nBananas are yellow.", encoding='utf-8')
    return user_guide

@pytest.fixture
def mock_settings(mock_user_guide, monkeypatch, conn):
    settings = get_test_settings().model_copy(update={'USER_GUIDE_PATH': str(mock_user_guide)})
    
    # Patch global settings access
    import scripts.index_user_guide
    import src.features.chat.retrieval
    import src.core.db
    monkeypatch.setattr(scripts.index_user_guide, "get_settings", lambda: settings)
    monkeypatch.setattr(src.features.chat.retrieval, "get_settings", lambda: settings)
    monkeypatch.setattr(src.core.db, "get_settings", lambda: settings)
    
    # Clear lru_cache for RAG pipeline
    get_rag_pipeline.cache_clear()
    
    return settings

@pytest.fixture
def document_store(mock_settings, conn):
    db_url = get_pgvector_url()
    store = PgvectorDocumentStore(
        connection_string=Secret.from_token(db_url),
        table_name='user_guide_documents',
        embedding_dimension=mock_settings.EMBEDDING_DIMENSION,
    )
    
    # Ensure table is clean before test
    try:
        store.delete_documents([doc.id for doc in store.filter_documents()])
    except Exception:
        pass
        
    yield store
    
    # Clean after test
    try:
        store.delete_documents([doc.id for doc in store.filter_documents()])
    except Exception:
        pass

@pytest.fixture
def mock_openai_embeddings(mock_settings):
    """Mocks OpenAI embeddings API via respx."""
    with respx.mock() as respx_mock:
        def embeddings_route(request: httpx.Request):
            payload = json.loads(request.content)
            input_text = payload.get("input", "")
            
            dim = mock_settings.EMBEDDING_DIMENSION
            if isinstance(input_text, list):
                # Multiple inputs (document embedding)
                data = []
                for i, text in enumerate(input_text):
                    emb = [0.0] * dim
                    emb[i % dim] = 1.0
                    
                    text_lower = text.lower()
                    if "apple" in text_lower:
                        emb[0] = 0.9
                    elif "banana" in text_lower:
                        emb[1] = 0.9
                        
                    data.append({"object": "embedding", "embedding": emb, "index": i})
            else:
                # Single input
                emb = [0.0] * dim
                text_lower = input_text.lower()
                if "apple" in text_lower:
                    emb[0] = 0.9
                elif "banana" in text_lower:
                    emb[1] = 0.9
                else:
                    emb[2] = 0.9
                    
                data = [{"object": "embedding", "embedding": emb, "index": 0}]
            
            return httpx.Response(200, json={
                "object": "list", 
                "data": data, 
                "model": mock_settings.EMBEDDING_MODEL,
                "usage": {"prompt_tokens": 10, "total_tokens": 10}
            })
            
        respx_mock.post(f"{mock_settings.EMBEDDING_BASE_URL}/embeddings").mock(side_effect=embeddings_route)
        yield respx_mock

def test_indexing_pipeline(mock_settings, document_store, mock_openai_embeddings, conn):
    num_files, num_chunks = run_indexing_pipeline()
    
    assert num_files == 2
    assert num_chunks == 2
    
    docs = document_store.filter_documents()
    assert len(docs) == 2

def test_indexing_idempotent(mock_settings, document_store, mock_openai_embeddings, mock_user_guide, conn):
    # Remove one file to test idempotency more clearly
    (mock_user_guide / "doc2.md").unlink()
    
    # Run once
    num_files, num_chunks = run_indexing_pipeline()
    assert num_chunks == 1
    
    # Run again
    num_files2, num_chunks2 = run_indexing_pipeline()
    assert num_chunks2 == 1
    
    docs = document_store.filter_documents()
    assert len(docs) == 1  # Should still be 1, not duplicated

def test_retrieval(mock_settings, document_store, mock_openai_embeddings, conn):
    dim = mock_settings.EMBEDDING_DIMENSION
    apple_emb = [0.0] * dim
    apple_emb[0] = 0.9
    
    banana_emb = [0.0] * dim
    banana_emb[1] = 0.9
    
    document_store.write_documents([
        Document(content="# Apple\n\nApples are red.", embedding=apple_emb),
        Document(content="# Banana\n\nBananas are yellow.", embedding=banana_emb),
    ])
    
    pipeline = get_rag_pipeline()
    
    # Query for Apple
    docs = retrieve_context("tell me about apple", pipeline)
    assert len(docs) > 0
    assert "Apples are red." in docs[0].content

def test_retrieval_threshold(mock_settings, document_store, mock_openai_embeddings, conn):
    dim = mock_settings.EMBEDDING_DIMENSION
    apple_emb = [0.0] * dim
    apple_emb[0] = 0.9
    
    document_store.write_documents([
        Document(content="# Apple\n\nApples are red.", embedding=apple_emb)
    ])
    
    pipeline = get_rag_pipeline()
    
    # Query for something irrelevant (will trigger emb[2]=0.9 in mock)
    # Cosine similarity with apple_emb will be 0, which is below default threshold 0.5
    docs = retrieve_context("tell me about cars", pipeline)
    assert len(docs) == 0
