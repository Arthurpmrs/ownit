import os
import re
import sys
import time
from pathlib import Path

from haystack import Document
from haystack.components.embedders import OpenAIDocumentEmbedder
from haystack.utils import Secret
from haystack_integrations.document_stores.pgvector import PgvectorDocumentStore

from src.core.config import get_settings


def parse_frontmatter(content: str) -> tuple[dict[str, str], str]:
    """Parse YAML-like frontmatter enclosed in --- at the start of content."""
    frontmatter = {}
    remaining_content = content

    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if match:
        frontmatter_block = match.group(1)
        remaining_content = content[match.end():]
        for line in frontmatter_block.split('\n'):
            if ':' in line:
                key, val = line.split(':', 1)
                frontmatter[key.strip()] = val.strip().strip('"').strip("'")

    return frontmatter, remaining_content


def chunk_markdown(content: str, filename: str, title: str) -> list[dict]:
    """Split markdown content by H1, H2, H3 headings."""
    lines = content.split('\n')

    # Find headings (H1, H2, H3)
    headings = []
    for idx, line in enumerate(lines):
        match = re.match(r'^(#{1,3})\s+(.+)$', line)
        if match:
            level = len(match.group(1))
            text = match.group(2).strip()
            headings.append({
                'text': text,
                'level': level,
                'line_idx': idx
            })

    chunks = []

    # If no headings, treat entire file as one chunk
    if not headings:
        text_content = '\n'.join(lines).strip()
        if text_content:
            chunks.append({
                'content': text_content,
                'metadata': {
                    'source_file': filename,
                    'title': title,
                    'section': ''
                }
            })
        return chunks

    # Capture any text before the first heading as Introduction
    first_heading_idx = headings[0]['line_idx']
    intro_text = '\n'.join(lines[:first_heading_idx]).strip()
    if intro_text:
        chunks.append({
            'content': intro_text,
            'metadata': {
                'source_file': filename,
                'title': title,
                'section': 'Introdução'
            }
        })

    # Process each heading and its content until a heading of equal or higher level
    for i, h in enumerate(headings):
        start_line = h['line_idx']
        level = h['level']

        # Find the next heading of equal or higher level (smaller or equal number)
        end_line = len(lines)
        for next_h in headings[i+1:]:
            if next_h['level'] <= level:
                end_line = next_h['line_idx']
                break

        chunk_text = '\n'.join(lines[start_line:end_line]).strip()
        if chunk_text:
            chunks.append({
                'content': chunk_text,
                'metadata': {
                    'source_file': filename,
                    'title': title,
                    'section': h['text']
                }
            })

    return chunks


def split_large_text(text: str, max_chars: int = 1500) -> list[str]:
    """Split text exceeding max_chars at paragraph boundaries."""
    if len(text) <= max_chars:
        return [text]

    paragraphs = text.split('\n\n')
    sub_chunks = []
    current_chunk = []
    current_len = 0

    for p in paragraphs:
        p_len = len(p)
        if current_chunk and current_len + p_len + 2 > max_chars:
            sub_chunks.append('\n\n'.join(current_chunk))
            current_chunk = [p]
            current_len = p_len
        else:
            current_chunk.append(p)
            current_len += p_len + (2 if current_len > 0 else 0)

    if current_chunk:
        sub_chunks.append('\n\n'.join(current_chunk))

    return sub_chunks


def scan_user_guide(directory: str) -> list[Path]:
    """Recursively find all .md files in the user-guide directory."""
    path = Path(directory).resolve()
    if not path.exists() or not path.is_dir():
        print(f"Error: User guide directory '{path}' does not exist.")
        return []
    return sorted(list(path.rglob('*.md')))


def run_indexing_pipeline():
    """Scan, chunk, embed, and write documents to the database."""
    settings = get_settings()

    print(f"Scanning user guide path: {settings.USER_GUIDE_PATH}")
    files = scan_user_guide(settings.USER_GUIDE_PATH)
    if not files:
        print("No markdown files found to index.")
        return 0, 0

    all_chunks = []
    for file_path in files:
        # Use path relative to user guide root
        rel_path = file_path.relative_to(Path(settings.USER_GUIDE_PATH).resolve())
        rel_path_str = str(rel_path)

        try:
            content = file_path.read_text(encoding='utf-8')
            frontmatter, remaining_content = parse_frontmatter(content)
            title = frontmatter.get('title', file_path.stem)

            chunks = chunk_markdown(remaining_content, rel_path_str, title)

            # Apply character limit chunking
            final_chunks_for_file = []
            for c in chunks:
                sub_texts = split_large_text(c['content'], max_chars=1500)
                for sub_text in sub_texts:
                    final_chunks_for_file.append({
                        'content': sub_text,
                        'metadata': c['metadata'].copy()
                    })
            all_chunks.extend(final_chunks_for_file)
        except Exception as e:
            print(f"Error parsing file {file_path}: {e}")
            raise

    print(f"Found {len(files)} files, generated {len(all_chunks)} chunks.")

    # Convert to Haystack Documents
    documents = [
        Document(content=c['content'], meta=c['metadata'])
        for c in all_chunks
    ]

    # Initialize pgvector document store
    print("Connecting to pgvector document store...")
    db_url = settings.DATABASE_URL
    if db_url.startswith('postgresql+psycopg://'):
        db_url = db_url.replace('postgresql+psycopg://', 'postgresql://')

    document_store = PgvectorDocumentStore(
        connection_string=Secret.from_token(db_url),
        table_name='user_guide_documents',
        embedding_dimension=settings.EMBEDDING_DIMENSION,
        vector_function='cosine_similarity',
        recreate_table=True,
    )

    # Initialize OpenAI document embedder
    embedder = OpenAIDocumentEmbedder(
        api_key=Secret.from_token(settings.EMBEDDING_API_KEY),
        api_base_url=settings.EMBEDDING_BASE_URL,
        model=settings.EMBEDDING_MODEL,
        dimensions=settings.EMBEDDING_DIMENSION,
    )

    print(f"Generating embeddings using model: {settings.EMBEDDING_MODEL}")
    embedded_docs = embedder.run(documents=documents)['documents']

    print("Saving documents to PgvectorDocumentStore...")
    document_store.write_documents(embedded_docs)

    return len(files), len(documents)


if __name__ == '__main__':
    start_time = time.monotonic()
    try:
        num_files, num_chunks = run_indexing_pipeline()
        elapsed = time.monotonic() - start_time
        print(f"Success! Indexed {num_files} files into {num_chunks} chunks in {elapsed:.2f}s.")
        sys.exit(0)
    except Exception as e:
        print(f"Failed to run indexing pipeline: {e}", file=sys.stderr)
        sys.exit(1)
