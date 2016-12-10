import os
import unittest
import tempfile

from endgame import app
from endgame.models import initialize_sql
from endgame.models import meta

class BaseTestCase(unittest.TestCase):

    def setUp(self):
        # Overwrite the main app.config with testing values from the below
        # configuration object.
        app.config.from_object('endgame.testing.config.TestingConfig')
        initialize_sql(config=app.config, encoding='utf-8')
        # create the necessary models in the in-memory database
        meta.Base.metadata.create_all(meta.engine)
        
        # not sure what this does at this point, but probably enables tests
        # of controllers, etc.
        self.app = app.test_client()
        

    def tearDown(self):
        # call remove() on the Session CLASS (not instantiated object) to
        # clear out the sqlalchemy config to prepare for next tests
        meta.Session.remove()
