from flask import request

from endgame import app
from endgame.controllers import templated
from endgame.models import AuthUser, meta

@app.route('/')
@templated('index.mako')
def index():
    s = meta.Session()
    users = s.query(AuthUser).all()
    app.logger.debug('Ran query against the database, and it worked.\n'
                    'There are %i users in the system' % len(users))
    return {'users':users}
