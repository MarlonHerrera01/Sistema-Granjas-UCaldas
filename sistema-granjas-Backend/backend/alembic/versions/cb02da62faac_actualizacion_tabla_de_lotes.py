"""actualizacion tabla de lotes

Revision ID: cb02da62faac
Revises: 614365bf24de
Create Date: 2025-12-19 17:42:49.342560

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cb02da62faac'
down_revision: Union[str, None] = '614365bf24de'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
