"""empty message

Revision ID: 89a5119c194e
Revises: e349e6e65eb1
Create Date: 2019-04-29 22:23:42.983882

"""

# revision identifiers, used by Alembic.
revision = '89a5119c194e'
down_revision = 'e349e6e65eb1'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    # op.drop_table('temp')
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    # op.create_table('temp',
    # sa.Column('id', sa.INTEGER(), nullable=False),
    # sa.Column('league_id', sa.INTEGER(), nullable=True),
    # sa.Column('name', sa.VARCHAR(length=255), nullable=True),
    # sa.Column('start', sa.DATETIME(), nullable=True),
    # sa.Column('end', sa.DATETIME(), nullable=True),
    # sa.ForeignKeyConstraint(['league_id'], ['league.id'], ),
    # sa.PrimaryKeyConstraint('id'),
    # sa.UniqueConstraint('name')
    # )
    ### end Alembic commands ###
