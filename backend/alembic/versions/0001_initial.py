"""initial schema"""
from alembic import op
import sqlalchemy as sa
revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None

from app.database.session import Base, engine
import app.models  # noqa

def upgrade():
    # Keep migration simple and aligned with SQLAlchemy models.
    Base.metadata.create_all(bind=engine)

def downgrade():
    Base.metadata.drop_all(bind=engine)
