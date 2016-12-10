# -*- coding: utf-8 -*-

from endgame.testing import BaseTestCase

from endgame.models import meta
from endgame.models import AuthUser

class TestAuthUser(BaseTestCase):
    def test_creating_a_user_and_getting_it(self):
        s = meta.Session()
        u = AuthUser('test@exañple.com', 'a password')
        s.add(u)
        s.commit()
        s.close()
        
        s = meta.Session()
        u = s.query(AuthUser).get('test@exañple.com')
        assert u is not None
    
    def test_creating_a_user_hashes_pw(self):
        ''' Not testing the algorithm, just that it isn't plain text'''
        u = AuthUser('test@exañple.com', 'a password')
        self.assertNotEqual(u.hashed_pw, 'a password')
    
    def test_hashed_pw_still_works(self):
        u = AuthUser('test@exañple.com', 'a password')
        self.assertTrue(u.checkpw('a password'))
    
    def test_bad_password_fails(self):
        u = AuthUser('test@exañple.com', 'a password')
        self.assertFalse(u.checkpw('a different password'))
