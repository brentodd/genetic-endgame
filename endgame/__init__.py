from flask import Flask
from flask_mako import MakoTemplates

from endgame.config import config
from endgame.models import initialize_sql, meta

app = Flask(__name__)

# Initialize the configuration. The from_object would load configuration from
# this very file, but I don't have any variables set up in here. But I guess
# it's good practice to say this anyway?
app.config.from_object(__name__)

# This variable config is loaded from endgame.config - it pulls from config
# files and/or environment variables.
app.config.update(config)

# Initialize Mako templates. This is using the flask_mako addon, rather than
# manually installing and configuring it myself. Was I lazy doing it this way?
# Yes. Yes I was.  I should do it manually...
mako = MakoTemplates(app)

# Import all of the controllers. This requires that `app` exists in endgame
# so it must happend after app is configured. (the @app.route decorator, etc)
from endgame.controllers import *

def makeapp():
    # Initialize SQLAlchemy - will pull DATABASE_URL from config variables by
    # default. Can add any arguments to this call which we would like passed 
    # to the engine. Executed in makeapp, because if we're doing TESTS we
    # do not want to do this yet because we will OVERWRITE the config with a
    # test database and call initialize_sql then.
    initialize_sql(config=app.config, encoding='utf-8')
    return app
    

def runserver():
    # Fire up the app - host and port  come from SERVER_NAME config variable
    makeapp().run()

# Really, you shouldn't just execute this file, but this will make sure that
# gives you what you're looking for.
if __name__ == "__main__":
    runserver()
