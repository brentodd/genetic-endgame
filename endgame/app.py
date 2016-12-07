import logging
import os

import tornado.ioloop
import tornado.web
from tornado.options import options

from endgame.routes import make_routes

def make_app(options):
    '''Create the tornado application'''
    return tornado.web.Application(make_routes(options),
        template_path=os.path.join(os.path.dirname(__file__), 'templates'),
        debug=options.debug,
    )

def runserver():
    '''Create the tornado application and start it up, listening on the 
    requested port.'''
    app = make_app(options)
    app.listen(options.port)
    print("Tornado Server listening on port %s" % options.port)
    tornado.ioloop.IOLoop.current().start()

# Not sure how to get heroku to run my runserver script to start the website,
# so right now it runs this file directly (see ../Procfile)
if __name__ == '__main__':
    runserver()
