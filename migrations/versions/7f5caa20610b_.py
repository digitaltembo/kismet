"""empty message

Revision ID: 7f5caa20610b
Revises: 89a5119c194e
Create Date: 2019-05-01 22:46:44.687249

"""

# revision identifiers, used by Alembic.
revision = '7f5caa20610b'
down_revision = '89a5119c194e'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    # op.drop_table('temp')
    with op.batch_alter_table('league', schema=None) as batch_op:
        batch_op.add_column(sa.Column('slack_team_id', sa.String(length=20), nullable=True))

    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('slack_user_id', sa.String(length=20), nullable=True))

    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('slack_user_id')

    with op.batch_alter_table('league', schema=None) as batch_op:
        batch_op.drop_column('slack_team_id')

    # op.create_table('temp',
    # sa.Column('id', sa.INTEGER(), nullable=False),
    # sa.Column('name', sa.VARCHAR(length=255), nullable=True),
    # sa.Column('current_season_id', sa.INTEGER(), nullable=True),
    # sa.Column('month_start', sa.DATETIME(), nullable=True),
    # sa.Column('allowed_users', sa.INTEGER(), nullable=True),
    # sa.Column('current_users', sa.INTEGER(), nullable=True),
    # sa.Column('allowed_monthly_games', sa.INTEGER(), nullable=True),
    # sa.Column('current_monthly_games', sa.INTEGER(), nullable=True),
    # sa.ForeignKeyConstraint(['current_season_id'], ['season.id'], ),
    # sa.PrimaryKeyConstraint('id'),
    # sa.UniqueConstraint('name')
    # )
    ### end Alembic commands ###