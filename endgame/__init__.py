import logging
import os
import pprint

from flask import Flask
from flask_mako import MakoTemplates



def load_config_env(app):
    '''In heroku, important shit will be in environment variables. In a local
    dev environment, they'll be in the .env file. '''
    oneup = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dot_env_file = os.path.join(oneup, '.env')
    if os.path.exists(dot_env_file):
        with open(dot_env_file, 'r') as env:
            for line in env.readlines():
                var,val = line.strip().split('=')
                # We want to PREFER what's in environ, if it exists
                if var in os.environ:
                    app.config.setdefault(var, os.environ[var])
                else:
                    app.config.setdefault(var, val)
    #app.config.setdefault('SECRET_KEY', os.environ.get('SECRET_KEY'))
    #app.config.setdefault('SERVER_NAME', 'http://localhost:8080')
    

app = Flask(__name__)
app.config.from_object(__name__)
load_config_env(app)
mako = MakoTemplates(app)

# Initialize SQLAlchemy - will pull DATABASE_URL from environ variables by
# default. Can add any arguments to this call which we would like passed to
# the engine
from endgame.models import initialize_sql, meta
initialize_sql(config=app.config, encoding='utf-8')

# add a helpers context parser, so `h` is available in templates
@app.context_processor
def context_helpers():
    from endgame.lib import helpers
    return dict(h = helpers)


# import all of the controllers
from endgame.controllers import *

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=int(app.config['PORT']))
