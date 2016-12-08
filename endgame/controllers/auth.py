import logging

import tornado.web

from endgame.models import AuthUser, meta

logger = logging.getLogger(__name__)

class LoginController(tornado.web.RequestHandler):
    def get(self):
        # we would want to render the login form, but it's an angular.js
        # thing. So... figure out some other time what to do.
        args = self.request.arguments
        logger.info(args)
        self.render('index.html')
    
    def post(self):
        args = self.request.arguments
        for k in args:
            if len(args[k])==1:
                args[k] = args[k][0].decode('utf-8')
            else:
                args[k] = [v.decode('utf-8') for v in args[k]]
        s = meta.Session()
        logger.info(args)
        u = s.query(AuthUser).get( args['username'] )
        logger.info(u)
        logger.info('password checks out: %s' % u.checkpw(args['password']))
