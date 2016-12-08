from tornado.web import StaticFileHandler

from endgame.controllers import Handler_Root
from endgame.controllers.auth import LoginController

def make_routes(options):
    ''' Return a list of tuples, appropriate to be passed to 
    tornado.web.Application'''
    return [
            (r'/', Handler_Root),
            (r'/login', LoginController),
            (r'(?:/static)?/(.*|favicon\.ico)|robots.txt', StaticFileHandler, 
                        {'path': options.static_path}),
            #(r'/roll', Handler_DoRoll),
            #(r'/rollsocket', Handler_SocketRolls),
        ]
