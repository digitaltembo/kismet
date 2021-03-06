"""empty message

Revision ID: b63ec9831ddd
Revises: af151aef258e
Create Date: 2019-05-06 15:50:17.926060

"""

# revision identifiers, used by Alembic.
revision = 'b63ec9831ddd'
down_revision = 'af151aef258e'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('league', schema=None) as batch_op:
        batch_op.add_column(sa.Column('month_credits', sa.Integer(), nullable=True))

    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('league', schema=None) as batch_op:
        batch_op.drop_column('month_credits')

    ### end Alembic commands ###
