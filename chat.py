import os

import tornado.websocket
import tornado.ioloop
import tornado.web

import time
import json
import random
import string
import re
import sys

rooms = {}


def get_token():
    return ''.join(random.SystemRandom().choice(
        string.ascii_lowercase + string.digits) for _ in range(30)
    )


class ChatRoom():
    def __init__(self, roomName, expiryLength, password=""):
        self.roomName = roomName
        self.expiryLength = expiryLength
        self.password = password
        self.messages = []
        self.clients = []
        self.users = {}
        pattern = re.compile('[\W_]+')
        self.id = pattern.sub('', roomName.lower())
        if self.id in rooms.keys():
            self.id = self.id + "_"
            while True:
                self.id = self.id + random.SystemRandom().choice(
                    string.ascii_lowercase + string.digits)
                if not (self.id in rooms.keys()):
                    break
        rooms[self.id] = self

    def addclient(self, client):
        self.clients.append(client)
        client.write_message('{"type":"roomid", "room":"'+self.id+'"}')
        for mess in self.messages:
            if not (mess.isExpired()):
                client.write_message(mess.data)

    def sendMessage(self, message):
        self.messages.append(Message(json.dumps(message), self.expiryLength))
        for client in self.clients:
            client.write_message(json.dumps(message))


class Message():
    def __init__(self, data, expiryTime):
        self.time = time.time()
        self.data = data
        self.expiryTime = expiryTime

    def __str__(self):
        return json.dumps(self)

    def isExpired(self):
        return self.time + self.expiryTime < time.time()


class User():
    def __init__(self, name, room):
        self.name = name
        self.room = room


class Handler(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        print("new client")

    def on_message(self, data):
        message = json.loads(data)
        if message["type"] == "msg":
            try:
                room = rooms[message["room"]]
                use = room.users[message["tok"]]
                message["username"] = use.name
                rooms[use.room].sendMessage(message)
            except:
                print(sys.exc_info()[0])
                self.write_message(
                    '{"type":"reciveerror", "message": '+data+'}'
                )

        elif message["type"] == "signin":
            try:
                room = rooms[message["room"]]
                if message["username"] in room.users.values():
                    self.write_message('{"type":"rejectedname"}')
                else:
                    token = get_token()
                    room.addclient(self)
                    room.users[token] = User(message["username"], room.id)
                    self.write_message('{"type":"tok","tok":"'+token+'"}')
            except:
                self.write_message('{"type":"roomnotfound"}')

    def on_close(self):
        print("a client left")
        for room in rooms.values():
            if self in room.clients:
                room.clients.remove(self)
        # TODO remove user from rooms more effeciently


class StaticHandler(tornado.web.StaticFileHandler):
    def parse_url_path(self, url_path):
        if not url_path or url_path.endswith('/'):
            url_path = url_path + 'index.html'
        return url_path


application = tornado.web.Application([
    (r"/websocket", Handler),
    (r"/(.*)", StaticHandler, {"path": os.getcwd()+"/www"})
])

ChatRoom("room", 60)

try:
    print("server starting")
    application.listen(8888)
    tornado.ioloop.IOLoop.current().start()
except KeyboardInterrupt:
    print("server exited")
