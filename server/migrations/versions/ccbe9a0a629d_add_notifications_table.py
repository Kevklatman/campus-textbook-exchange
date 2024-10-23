"""Add notifications table

Revision ID: ccbe9a0a629d
Revises: 85916dc7d089
Create Date: 2024-10-23 16:38:25.491385

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ccbe9a0a629d'
down_revision = '85916dc7d089'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('notifications',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('post_id', sa.Integer(), nullable=False),
    sa.Column('message', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.Column('read', sa.Boolean(), nullable=True),
    sa.ForeignKeyConstraint(['post_id'], ['posts.id'], name=op.f('fk_notifications_post_id_posts')),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_notifications_user_id_users')),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_notifications'))
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('notifications')
    # ### end Alembic commands ###
