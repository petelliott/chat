import os

import tornado.websocket
import tornado.ioloop
import tornado.web

import time
import json
import random
import string

clients = []
messages = []

users = {}


class Message():
    expiryTime = 24*60*60

    def __init__(self, data):
        self.time = time.time()
        self.data = data

    def __str__(self):
        return json.dumps(self)

    def getTimeStamp(data):
        return self.time

    def getData(self):
        return self.data

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

    def on_message(self, data):
        message = json.loads(data)
        if message["type"] == "msg":
            try:
                message["username"] = users[message["tok"]]
                messages.append(Message(json.dumps(message)))
                for client in clients:
                    client.write_message(json.dumps(message))
            except:
                self.write_message('{"type":"invalidtok"}')

        elif message["type"] == "validusername":
            if message["username"] in users.values():
                self.write_message('{"type":"rejectedname"}')
            else:
                token = ''.join(random.SystemRandom().choice(
                    string.ascii_lowercase + string.digits) for _ in range(30)
                )
                users[token] = message["username"]
                self.write_message('{"type":"tok","tok":"'+token+'"}')
        elif message["type"] == "isvalidtok":
            print(message)
            if not message["tok"] in users.keys():
                if message["username"] in users.values():
                    self.write_message('{"type":"invalidtok"}')
                else:
                    token = ''.join(random.SystemRandom().choice(
                        string.ascii_lowercase + string.digits) for _ in range(30)
                    )
                    users[token] = message["username"]
                    self.write_message('{"type":"tok","tok":"'+token+'"}')

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

try:
    print("server starting")
    application.listen(8888)
    tornado.ioloop.IOLoop.current().start()
except KeyboardInterrupt:
    print("server exited")
