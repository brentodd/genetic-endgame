from sqlalchemy import MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker

__all__ = ['Base', 'Session']

metadata = MetaData()

Session = scoped_session(sessionmaker(autocommit=True))
Base = declarative_base(metadata=metadata)
