"""Agrega campo Fecha de venc en tabla de insumos

Revision ID: 95f55a6d091f
Revises: d54ecf0b5c3c
Create Date: 2025-12-19 19:09:44.983608

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '95f55a6d091f'
down_revision: Union[str, None] = 'd54ecf0b5c3c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
