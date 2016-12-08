import os
from sqlalchemy import create_engine

from endgame.models import meta

from endgame.models.auth_users import AuthUser

def initialize_sql(db_url=os.environ.get('DATABASE_URL'), *args, **kwargs):
    if db_url is None:
        raise Exception('No Database URL')
    meta.engine = create_engine(db_url, **kwargs)
    meta.metadata.bind = meta.engine
    meta.Session.configure(bind=meta.engine)
