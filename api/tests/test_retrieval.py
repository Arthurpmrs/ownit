import pytest
from haystack import Document

from src.features.chat.retrieval import (
    ContextFilter,
    format_context,
)
from src.features.chat.pipeline import build_haystack_messages


def test_context_filter():
    filter_comp = ContextFilter(similarity_threshold=0.5, max_tokens=20)
    
    doc1 = Document(content="Short content", score=0.8)
    doc2 = Document(content="Also short", score=0.9)
    doc3 = Document(content="Bad score", score=0.4)
    doc4 = Document(content="This is a very long document that will definitely exceed the twenty tokens limit because it has many many words", score=0.7)
    
    result = filter_comp.run(documents=[doc1, doc2, doc3, doc4])
    docs = result["documents"]
    
    # Should drop doc3 (score < 0.5)
    # Should sort doc2 (0.9), doc1 (0.8), doc4 (0.7)
    # doc4 is very long and max_tokens=20, so it will exceed the limit and be dropped
    assert len(docs) == 2
    assert docs[0].content == "Also short"
    assert docs[1].content == "Short content"


def test_format_context():
    docs = [
        Document(content="Content 1", meta={"source_file": "doc1.md", "section": "Intro"}),
        Document(content="Content 2", meta={"source_file": "doc2.md"}),
    ]
    
    context = format_context(docs)
    assert "[Fonte: doc1.md > Intro]" in context
    assert "Content 1" in context
    assert "[Fonte: doc2.md]" in context
    assert "Content 2" in context


def test_format_context_empty():
    assert format_context([]) == ""


def test_build_haystack_messages_with_context(monkeypatch):
    from src.features.chat import pipeline
    
    def mock_fetch(history, rag_pipeline):
        return "MOCKED RAG CONTEXT"
        
    monkeypatch.setattr(pipeline, "_fetch_rag_context_for_query", mock_fetch)
    
    history = [{"role": "user", "content": "How do I do X?"}]
    messages = pipeline.build_haystack_messages(history, rag_pipeline=None)
    
    sys_msg = messages[0]
    assert sys_msg.role.value == "system"
    assert "MOCKED RAG CONTEXT" in sys_msg.text
    assert messages[1].role.value == "user"
    assert messages[1].text == "How do I do X?"


def test_build_haystack_messages_no_context(monkeypatch):
    from src.features.chat import pipeline
    
    def mock_fetch(history, rag_pipeline):
        return ""
        
    monkeypatch.setattr(pipeline, "_fetch_rag_context_for_query", mock_fetch)
    
    history = [{"role": "user", "content": "Hello"}]
    messages = pipeline.build_haystack_messages(history, rag_pipeline=None)
    
    sys_msg = messages[0]
    assert sys_msg.role.value == "system"
    # Ensure no context block is added if it's empty
    assert "\n\n" not in sys_msg.text or "MOCKED RAG CONTEXT" not in sys_msg.text
