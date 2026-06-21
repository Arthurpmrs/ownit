"""enable pgvector extension

Revision ID: 28cd9f8c4bb0
Revises: fbaf4db47ddd
Create Date: 2026-06-19 15:46:43.763078

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '28cd9f8c4bb0'
down_revision: Union[str, Sequence[str], None] = 'fbaf4db47ddd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute('CREATE EXTENSION IF NOT EXISTS vector')


def downgrade() -> None:
    """Downgrade schema."""
    op.execute('DROP EXTENSION IF EXISTS vector')
