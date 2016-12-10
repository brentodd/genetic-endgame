from endgame import app
from endgame.controllers.index import index
from endgame.models import meta



# Here it is reasonable to require that endgame.app exists and is a flask
# app. If we're creating controllers for the app, it's because we're going to
# be using them as part of an app.



# Set up some of the other basic features we will be using in our application.


# === The app.teardown_appcontext handlers ===
# These run after every request. Do whatever cleanup needs to happen in these.
# We can register as many as necessary, but there IS overhead for each 
# separate function call, so don't register hundreds of them...

# Clean up SQLAlchemy sessions after every request. We don't want autocommit
# enabled (because it's lazy, dammit), but we don't want to FORGET to commit
# our sessions (because that's bad). So this will ensure the sessions are all
# committed properly and closed.
@app.teardown_appcontext
def post_request_close_session(error):
    s = meta.Session()
    try:
        if error is not None:
            # Request ended due to an exception... try a rollback
            s.rollback()
        else:
            # no error, try a commit. May still error out if no transaction
            s.commit()
    except Exception as e:
        app.logger.error('Error committing session', e)
        s.rollback()
    finally:
        s.close()


# === The app.context_processors ===
# Context processors will add things into the template context, so if we want
# there to be an `h` object in our templates with references to helpful 
# utility functions, we do it here (see the context_helpers() function.)

# add a helpers context parser, so `h` is available in templates
@app.context_processor
def context_helpers():
    from endgame.lib import helpers
    return dict(h = helpers)
