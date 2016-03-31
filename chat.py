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


class chathtml(tornado.web.RequestHandler):
    def get(self):
        self.write(open("chat.html").read())


class chatjs(tornado.web.RequestHandler):
    def get(self):
        self.set_header("Content-Type", "application/javascript")
        self.write(open("chat.js").read())


class stylesheet(tornado.web.RequestHandler):
    def get(self):
        self.set_header("Content-Type", "text/css")
        self.write(open("styleSheet.css").read())


application = tornado.web.Application([
    (r"/websocket", Handler),
    (r"/", chathtml),
    (r"/chat.js", chatjs),
    (r"/styleSheet.css", stylesheet)
])
application.listen(8888)
tornado.ioloop.IOLoop.current().start()
