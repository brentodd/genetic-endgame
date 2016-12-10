from flask import request

from flask_mako import render_template

from endgame import app
from endgame.models import AuthUser, meta

@app.route('/')
def index():
    s = meta.Session()
    users = s.query(AuthUser).all()
    app.logger.debug('Ran query against the database, and it worked.\n'
                    'There are %i users in the system' % len(users))
    return render_template('index.mako')
