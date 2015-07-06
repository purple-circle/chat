(function() {
  require("newrelic");

  module.exports = function(server, sessionStore) {
    var Q, chat, default_chat_id, imgur, io, rooms, users;
    io = require("socket.io").listen(server);
    chat = require("./models/chat");
    rooms = require("./models/rooms");
    imgur = require("./models/imgur");
    users = require("./models/user");
    Q = require("q");
    io.use(function(socket, next) {
      return sessionStore(socket.request, socket.request.res, next);
    });
    default_chat_id = "chat-123";
    return io.on("connection", function(socket) {
      var broadcastClientCount;
      socket.join(default_chat_id);
      broadcastClientCount = function(data) {
        var chatId, clientsCount, roomData;
        chatId = (data != null ? data.chatId : void 0) || default_chat_id;
        roomData = {};
        if (io.sockets.adapter.rooms[chatId]) {
          roomData = io.sockets.adapter.rooms[chatId];
        }
        clientsCount = Object.keys(roomData).length;
        return io.to(chatId).emit("get_online_count", clientsCount);
      };
      socket.on("disconnect", function() {
        return broadcastClientCount(null);
      });
      socket.on("load_chat_messages_for_room", function(data) {
        return chat.load_messages_for_room(data).then(function(messages) {
          var i, len, message, ref, ref1, ref2, ref3, url, urls, urlsObject;
          urls = [];
          urlsObject = {};
          for (i = 0, len = messages.length; i < len; i++) {
            message = messages[i];
            if (!((ref = message.metadata) != null ? (ref1 = ref.urls) != null ? ref1[0] : void 0 : void 0)) {
              continue;
            }
            url = (ref2 = message.metadata) != null ? (ref3 = ref2.urls) != null ? ref3[0] : void 0 : void 0;
            if ((url != null) && !urlsObject[url]) {
              urlsObject[url] = true;
              urls.push(chat.getOpenGraphData(url));
            }
          }
          if (urls.length > 0) {
            return Q.all(urls).then(function(found_urls) {
              var j, k, len1, len2, ref4, ref5;
              for (j = 0, len1 = found_urls.length; j < len1; j++) {
                url = found_urls[j];
                if (url != null) {
                  for (k = 0, len2 = messages.length; k < len2; k++) {
                    message = messages[k];
                    if (url.url === ((ref4 = message.metadata) != null ? (ref5 = ref4.urls) != null ? ref5[0] : void 0 : void 0)) {
                      message.url_data = url;
                    }
                  }
                }
              }
              return socket.emit("load_chat_messages_for_room", messages);
            }, function(err) {
              return socket.emit("load_chat_messages_for_room", messages);
            });
          } else {
            return socket.emit("load_chat_messages_for_room", messages);
          }
        });
      });
      socket.on("save_imgur", function(data) {
        return imgur.save(data);
      });
      socket.on("i_am_typing", function(data) {
        return io.to(default_chat_id).emit("typing", data);
      });
      socket.on("save_chat_message", function(data) {
        return chat.save(data).then(function(result) {
          var ref, ref1;
          if ((ref = result.metadata) != null ? ref.urls : void 0) {
            chat.getUrlDataRetry((ref1 = result.metadata) != null ? ref1.urls[0] : void 0).then(function(url_data) {
              data = {
                message: result,
                url_data: url_data
              };
              socket.emit("url_data", data);
              return socket.broadcast.emit("url_data", data);
            });
          }
          return io.to(default_chat_id).emit("save_chat_message", result);
        });
      });
      socket.on("load_topic", function(data) {
        return chat.load_topic(data).then(function(result) {
          return socket.emit("topic", result);
        });
      });
      socket.on("save_topic", function(data) {
        return chat.save_topic(data).then(function(result) {
          return io.to(default_chat_id).emit("topic", result);
        });
      });
      socket.on("load_rooms", function(data) {
        return rooms.get_rooms(data).then(function(result) {
          return io.to(default_chat_id).emit("rooms", result);
        });
      });
      socket.on("create_room", function(data) {
        return rooms.create(data).then(function(result) {
          return io.to(default_chat_id).emit("room_created", result);
        });
      });
      socket.on("signup", function(data) {
        var error, success;
        error = function(error) {
          return socket.emit("signup_error", {
            error: error
          });
        };
        success = function(account) {
          return socket.emit("signup", {
            account: account
          });
        };
        return users.localSignup(data).then(success, error);
      });
      socket.on("login", function(data) {
        var error, success;
        error = function(error) {
          return socket.emit("login_error", {
            error: error
          });
        };
        success = function(account) {
          return socket.emit("login", {
            account: account
          });
        };
        return users.login(data).then(success, error);
      });
      return socket.on("get_online_count", function(data) {
        return broadcastClientCount(data);
      });
    });
  };

}).call(this);
