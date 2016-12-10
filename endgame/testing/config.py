
class TestingConfig(object):
    '''This object is loaded into the app.config.from_object function to
    overwire any necessary configuration variable for testing purposes. This 
    happens AFTER the initial app is configured upon initial import.'''
    TESTING = True
    DATABASE_URL = 'sqlite://'
