import os

import tornado.websocket
import tornado.ioloop
import tornado.web
import time

clients = []
messages = []

class Message():
    expiryTime = 24*60*60;
    def __init__(self, data):
        self.time = time.time()
        self.data = data
    def __str__(self):
        return "{'time':"+self.time+",'data':'"+data+"'}"
    def getTimeStamp(data):
        return self.time
    def getData(self):
        return self.data;
    def isExpired(self):
        return self.time + self.expiryTime < time.time()



class Handler(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        print("new client")
        clients.append(self)
        for mess in messages:
            if not (mess.isExpired()):
                clients[-1].write_message(mess.getData())

    def on_message(self, message):
        messages.append(Message(message));
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
    (r"/(.*)", StaticHandler, {"path": os.getcwd()+"/www"})
])

application.listen(8888)
tornado.ioloop.IOLoop.current().start()
