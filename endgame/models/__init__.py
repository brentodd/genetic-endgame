import logging
import os
import sys
from sqlalchemy import create_engine

from endgame import app
from endgame.models import meta

from endgame.models.auth_users import AuthUser

logger = logging.getLogger(__name__)

def initialize_sql(config, *args, **kwargs):
    if 'DATABASE_URL' not in config:
        raise Exception('No Database URL')
    meta.engine = create_engine(config['DATABASE_URL'], **kwargs)
    meta.metadata.bind = meta.engine
    meta.Session.configure(bind=meta.engine)


# add a cleanup function to the app?
@app.after_request
def post_request_close_session(response):
    s = meta.Session()
    try:
        print('Committing any leftover db session')
        s.commit()
    except Exception as e:
        lprint('Error committing session', e)
        s.rollback()
    finally:
        print('Closing db session')
        s.close()
    sys.stdout.flush()
    return response
