from tornado.web import StaticFileHandler

from endgame.controllers import Handler_Root

def make_routes(options):
    ''' Return a list of tuples, appropriate to be passed to 
    tornado.web.Application'''
    return [
            (r'/', Handler_Root),
            (r'/static/(.*)', StaticFileHandler, 
                        {'path': options.static_path}),
            #(r'/roll', Handler_DoRoll),
            #(r'/rollsocket', Handler_SocketRolls),
        ]
