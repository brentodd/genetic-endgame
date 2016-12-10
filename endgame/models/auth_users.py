import datetime

import bcrypt
from sqlalchemy import (Column, String, DateTime, Integer)

from endgame.models import meta

class AuthUser(meta.Base):
    __tablename__ = 'auth_users'
    
    username = Column(String(length=30), primary_key=True,)
    hashed_pw = Column(String(length=200), nullable=False)
    created = Column(DateTime(timezone=False), 
                     default=datetime.datetime.now)
    lastlogin = Column(DateTime(timezone=False))
    lastattempt = Column(DateTime(timezone=False))
    attempts = Column(Integer(), default=0)
    locked = Column(String(length=1), default='U')
    
    def __init__(self, username, pw):
        self.username = username
        self.hashed_pw = bcrypt.hashpw(pw.encode('utf-8'), bcrypt.gensalt())
    
    def checkpw(self, pw):
        if bcrypt.checkpw(pw.encode('utf-8'), self.hashed_pw):
            return True
        else:
            return False
