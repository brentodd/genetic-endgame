#!python
import os


'''
Loads any configuration options for endgame from the following sources:
  * Environment Variables
  * Any .env file resident in the startup directory
  * Potentially any config file passed in when starting up the application

The load config function will handle that - and it will only be called
once when the application is started up. The function will return a dict
which can then be passed to the flask app (app.config.update({})).  
'''
def load_config_env():
    c = {}
    # In heroku, important shit will be in environment variables. In a local
    # dev environment, they'll be in the .env file. Find .env file. Load it 
    # if it exists
    oneup = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dot_env_file = os.path.join(oneup, '.env')
    if os.path.exists(dot_env_file):
        with open(dot_env_file, 'r') as env:
            for line in env.readlines():
                if len(line) and line.startswith('#'):
                    continue
                if '=' in line:
                    var,val = line.strip().split('=')
                    c[var] = val
    
    # At this point, we've loaded a LOCAL .env file as our configuration. But
    # when running on live heroku, the .env doesn't exist (or if it does it
    # was mistakenly checked in to git), so we want to pull out the REAL
    # values from the os.environ. So, any heroku environment variables I KNOW
    # I need can be added here, to ensure they aren't clobbered by the above.
    if 'DATABASE_URL' in os.environ:
        c['DATABASE_URL'] = os.environ['DATABASE_URL']
    
    # We also want to load up specific config files, for example when running
    # unit tests. How to handle that? Pass from command line? Since heroku
    # loads from environment variables, maybe we do that? That's one of the
    # recommended method in flask as well... app.config.from_envvar. I don't
    # particularly like that, however.
    return c
    

config = load_config_env()
