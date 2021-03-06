"""empty message

Revision ID: fb084f39d6b3
Revises: 7186ad9b9b92
Create Date: 2019-05-14 20:44:27.221936

"""

# revision identifiers, used by Alembic.
revision = 'fb084f39d6b3'
down_revision = '7186ad9b9b92'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('league', schema=None) as batch_op:
        batch_op.add_column(sa.Column('slack_webhook', sa.String(length=128), nullable=True))

    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('league', schema=None) as batch_op:
        batch_op.drop_column('slack_webhook')

    ### end Alembic commands ###
