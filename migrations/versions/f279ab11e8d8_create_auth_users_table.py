"""Create auth_users table

Revision ID: f279ab11e8d8
Revises: 
Create Date: 2016-12-07 14:00:08.399496

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f279ab11e8d8'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'auth_users',
        sa.Column('username', sa.String(30), primary_key=True),
        sa.Column('hashed_pw', sa.Unicode(200), nullable=False),
        sa.Column('created', sa.DateTime(timezone=False), 
                  server_default='now()'),
        sa.Column('lastlogin', sa.DateTime(timezone=False)),
        sa.Column('lastattempt', sa.DateTime(timezone=False)),
        sa.Column('attempts', sa.Integer, default=0),
        sa.Column('locked', sa.Unicode(1), default='U')
    )

def downgrade():
    op.drop_table('auth_users')
