"""empty message

Revision ID: af151aef258e
Revises: 7f5caa20610b
Create Date: 2019-05-03 17:12:30.863553

"""

# revision identifiers, used by Alembic.
revision = 'af151aef258e'
down_revision = '7f5caa20610b'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('league', schema=None) as batch_op:
        batch_op.add_column(sa.Column('registration_code', sa.String(length=10), nullable=True))

    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('league', schema=None) as batch_op:
        batch_op.drop_column('registration_code')

    ### end Alembic commands ###
