from sqlalchemy import MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker

__all__ = ['Base', 'engine', 'metadata', 'Session']

# SQLAlchemy machinery. Base is used for all declarative models, Session is
# used whenever we want a database connection. engine and meta data are used
# less often in the rest of the code.

# These values are actually set in endgame.models.initialize_sql. Database
# will not work if that function (or something similar) is not called.

engine = None  # overwritten in endgame.models.initialize_sql
metadata = MetaData()

# I prefer to NOT use autocommit - I want to say when a transaction is sent
# to the database. Call me silly?
Session = scoped_session(sessionmaker(autocommit=False))
Base = declarative_base(metadata=metadata)
