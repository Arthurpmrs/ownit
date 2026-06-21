import re
import sys
import time
import yaml
from pathlib import Path

from haystack import Document, Pipeline, component
from haystack.components.converters.txt import TextFileToDocument
from haystack.components.embedders import OpenAIDocumentEmbedder
from haystack.components.preprocessors import MarkdownHeaderSplitter
from haystack.components.writers import DocumentWriter
from haystack.document_stores.types import DuplicatePolicy
from haystack.utils import Secret
from haystack_integrations.document_stores.pgvector import PgvectorDocumentStore

from src.core.config import get_settings


def parse_frontmatter(content: str) -> tuple[dict[str, str], str]:
    """Parse YAML frontmatter enclosed in --- at the start of content."""
    frontmatter = {}
    remaining_content = content

    if not content.startswith('---'):
        return frontmatter, remaining_content

    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if match:
        frontmatter_block = match.group(1)
        remaining_content = content[match.end():]
        try:
            parsed = yaml.safe_load(frontmatter_block)
            if isinstance(parsed, dict):
                # Ensure all values are strings to match the type hint
                frontmatter = {str(k): str(v) for k, v in parsed.items()}
            else:
                print("Warning: Frontmatter is not a valid YAML dictionary, ignoring.", file=sys.stderr)
        except yaml.YAMLError as e:
            print(f"Error parsing frontmatter YAML: {e}", file=sys.stderr)

    return frontmatter, remaining_content


@component
class FrontmatterExtractor:
    """Extracts frontmatter from documents and adds it to their metadata."""
    
    def __init__(self, user_guide_path: str):
        self.user_guide_path = Path(user_guide_path).resolve()
        
    @component.output_types(documents=list[Document])
    def run(self, documents: list[Document]):
        processed_docs = []
        for doc in documents:
            if doc.content is None:
                processed_docs.append(doc)
                continue

            frontmatter, remaining_content = parse_frontmatter(doc.content)
            meta = doc.meta.copy() if doc.meta else {}
            meta.update(frontmatter)
            
            # Use 'title' from frontmatter or fallback to filename if possible
            if 'title' not in meta and 'file_path' in meta:
                meta['title'] = Path(meta['file_path']).stem
                
            # Add relative path 'source_file' if file_path is present
            if 'file_path' in meta:
                try:
                    rel_path = Path(meta['file_path']).relative_to(self.user_guide_path)
                    meta['source_file'] = str(rel_path)
                except ValueError:
                    meta['source_file'] = Path(meta['file_path']).name

            processed_docs.append(Document(content=remaining_content, meta=meta))
            
        return {"documents": processed_docs}


def scan_user_guide(directory: str) -> list[Path]:
    """Recursively find all .md files in the user-guide directory."""
    path = Path(directory).resolve()
    if not path.exists() or not path.is_dir():
        print(f"Error: User guide directory '{path}' does not exist.")
        return []
    return sorted(list(path.rglob('*.md')))


def run_indexing_pipeline():
    """Scan files and run the Haystack indexing pipeline."""
    settings = get_settings()

    print(f"Scanning user guide path: {settings.USER_GUIDE_PATH}")
    files = scan_user_guide(settings.USER_GUIDE_PATH)
    if not files:
        print("No markdown files found to index.")
        return 0, 0
        
    print(f"Found {len(files)} files.")

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

    pipeline = Pipeline()
    pipeline.add_component("converter", TextFileToDocument())
    pipeline.add_component("frontmatter", FrontmatterExtractor(user_guide_path=settings.USER_GUIDE_PATH))
    pipeline.add_component("splitter", MarkdownHeaderSplitter(keep_headers=True, secondary_split="word", split_length=300, split_overlap=20))
    pipeline.add_component("embedder", OpenAIDocumentEmbedder(
        api_key=Secret.from_token(settings.EMBEDDING_API_KEY),
        api_base_url=settings.EMBEDDING_BASE_URL,
        model=settings.EMBEDDING_MODEL,
        dimensions=settings.EMBEDDING_DIMENSION,
    ))
    pipeline.add_component("writer", DocumentWriter(document_store=document_store, policy=DuplicatePolicy.OVERWRITE))

    pipeline.connect("converter", "frontmatter")
    pipeline.connect("frontmatter", "splitter")
    pipeline.connect("splitter", "embedder")
    pipeline.connect("embedder", "writer")

    print(f"Running pipeline to index documents and generate embeddings using {settings.EMBEDDING_MODEL}...")
    result = pipeline.run({"converter": {"sources": files}})
    
    num_chunks = result.get("writer", {}).get("documents_written", 0)
    return len(files), num_chunks


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
