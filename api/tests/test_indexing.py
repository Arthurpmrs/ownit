import pytest
from pathlib import Path
from haystack import Document

from scripts.index_user_guide import (
    parse_frontmatter,
    FrontmatterExtractor,
    scan_user_guide,
)


def test_parse_frontmatter():
    content = """---
title: My Title
section: Guide
---
# Content here
And more.
"""
    frontmatter, remaining = parse_frontmatter(content)
    assert frontmatter == {'title': 'My Title', 'section': 'Guide'}
    assert remaining == "# Content here\nAnd more.\n"


def test_parse_frontmatter_empty():
    content = "# Just content"
    frontmatter, remaining = parse_frontmatter(content)
    assert frontmatter == {}
    assert remaining == "# Just content"


def test_frontmatter_extractor(tmp_path):
    user_guide_path = tmp_path / "user_guide"
    user_guide_path.mkdir()
    
    extractor = FrontmatterExtractor(user_guide_path=str(user_guide_path))
    
    doc1 = Document(content="""---
title: Explicit Title
---
Content
""", meta={"file_path": str(user_guide_path / "doc1.md")})

    doc2 = Document(content="No frontmatter here", meta={"file_path": str(user_guide_path / "doc2.md")})

    result = extractor.run(documents=[doc1, doc2])
    docs = result["documents"]
    
    assert len(docs) == 2
    assert docs[0].meta["title"] == "Explicit Title"
    assert docs[0].meta["source_file"] == "doc1.md"
    assert docs[0].content == "Content\n"
    
    assert docs[1].meta["title"] == "doc2"
    assert docs[1].meta["source_file"] == "doc2.md"
    assert docs[1].content == "No frontmatter here"


def test_scan_user_guide(tmp_path):
    user_guide_path = tmp_path / "user_guide"
    user_guide_path.mkdir()
    (user_guide_path / "a.md").touch()
    (user_guide_path / "b.txt").touch()
    
    sub = user_guide_path / "sub"
    sub.mkdir()
    (sub / "c.md").touch()
    
    files = scan_user_guide(str(user_guide_path))
    assert len(files) == 2
    file_names = [f.name for f in files]
    assert "a.md" in file_names
    assert "c.md" in file_names
