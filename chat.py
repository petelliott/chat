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


application = tornado.web.Application([
    (r"/websocket", Handler),
])
application.listen(8888)
tornado.ioloop.IOLoop.current().start()
