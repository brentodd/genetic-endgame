from sqlalchemy import create_engine

from endgame.models import meta

# Import all Models from their respective modules here, so that they can be
# easily imported as `from endgame.models import <whatever>`, rather than
# needing to know the whole path. Be nice! Keep them alphabetized if possible
# (sometimes some other file needs to be imported first...).
from endgame.models.auth_users import AuthUser


def initialize_sql(config, *args, **kwargs):
    # Pull the database URL from the configuration, and do the necessary bits
    # of sqlalchemy setup.
    if 'DATABASE_URL' not in config:
        raise Exception('No Database URL')
    meta.engine = create_engine(config['DATABASE_URL'], **kwargs)
    meta.metadata.bind = meta.engine
    meta.Session.configure(bind=meta.engine)
