import os

import tornado.websocket
import tornado.ioloop
import tornado.web

clients = []


class Handler(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        print("new client")
        clients.append(self)

    def on_message(self, message):
        for client in clients:
            client.write_message(message)

    def on_close(self):
        print("a client left")
        clients.remove(self)


class StaticHandler(tornado.web.StaticFileHandler):
    def parse_url_path(self, url_path):
        if not url_path or url_path.endswith('/'):
            url_path = url_path + 'index.html'
        return url_path


application = tornado.web.Application([
    (r"/websocket", Handler),
    (r"/(.*)", StaticHandler, {"path": os.getcwd()})
])

application.listen(8888)
tornado.ioloop.IOLoop.current().start()
