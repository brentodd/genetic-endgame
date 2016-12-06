import logging
import os

from tornado import gen
from tornado.concurrent import Future
import tornado.escape
import tornado.ioloop
import tornado.web
import tornado.websocket
from tornado.web import StaticFileHandler
from tornado.options import define, options, parse_command_line

define("port", default='80', help="Port to run app on")
define("debug", default=False, help="run in debug mode")

static_path = os.path.join(os.path.dirname(__file__), 'static')

class Handler_Root(tornado.web.RequestHandler):
    def get(self):
        self.render('index.html')

def make_app():
    return tornado.web.Application([
            (r'/', Handler_Root),
            (r'/static/(.*)', StaticFileHandler, {'path': static_path}),
            #(r'/roll', Handler_DoRoll),
            #(r'/rollsocket', Handler_SocketRolls),
        ],
        template_path=os.path.join(os.path.dirname(__file__), 'templates'),
        debug=options.debug,
    )

parse_command_line()

PORT = os.environ.get('PORT',int(options.port))

def runserver():
    app = make_app()
    app.listen(PORT)
    print("Tornado Server listening on port %i" % PORT)
    tornado.ioloop.IOLoop.current().start()

if __name__ == '__main__':
    runserver()
