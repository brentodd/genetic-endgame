import datetime

import bcrypt
from sqlalchemy import (Column, Unicode, DateTime, Integer)

from endgame.models import meta

class AuthUser(meta.Base):
    __tablename__ = 'auth_users'
    
    username = Column(Unicode(length=30), primary_key=True,)
    hashed_pw = Column(Unicode(length=200), nullable=False)
    created = Column(DateTime(timezone=False), 
                     default=datetime.datetime.now)
    lastlogin = Column(DateTime(timezone=False))
    lastattempt = Column(DateTime(timezone=False))
    attempts = Column(Integer(), default=0)
    locked = Column(Unicode(length=1), default='U')
    
    def __str__(self):
        return '<AuthUser object username=%s>' % self.username
    
    def checkpw(self, pw):
        if bcrypt.checkpw(pw.encode('utf-8'), self.hashed_pw.encode('utf-8')):
            return True
        else:
            return False
