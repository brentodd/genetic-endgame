import logging
import os

#from tornado import gen
#from tornado.concurrent import Future
#import tornado.escape
import tornado.ioloop
import tornado.web
#import tornado.websocket
from tornado.options import define, options, parse_command_line

from endgame.routes import make_routes


'''
We're just going to set up the options for running the site. Actually run the
site using endgame.app:runserver.
'''


# Define the command line options for running the site
define("port",
       default=os.environ.get('PORT',8080),
       type=int,
       help="Port to run app on")

define("debug",
       default=False,
       help="run in debug mode")

define("static-path",
       default=os.path.join(os.path.dirname(__file__), 'static'),
       help="Location of static resources (js, css, images, etc)")

# Parse the command line options, so they are available in the global
# tornado.options.options object
parse_command_line()


