"""actualizacion tabla de lotes V1

Revision ID: edade51efbda
Revises: cb02da62faac
Create Date: 2025-12-19 17:48:34.785188

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'edade51efbda'
down_revision: Union[str, None] = 'cb02da62faac'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
