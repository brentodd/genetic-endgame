import tornado.web

class Handler_Root(tornado.web.RequestHandler):
    def get(self):
        self.render('index.html')
