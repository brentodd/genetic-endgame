import logging

from flask_mako import render_template

from endgame import app
from endgame.models import AuthUser, meta

logger = logging.getLogger(__name__)

@app.route('/')
def index():
    s = meta.Session()
    users = s.query(AuthUser).all()
    logger.info(users)
    return render_template('index.mako')
