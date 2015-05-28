(function() {
  require('newrelic');

  module.exports = function(server, sessionStore) {
    var Q, chat, imgur, io, rooms;
    io = require("socket.io").listen(server);
    chat = require("./models/chat");
    rooms = require("./models/rooms");
    imgur = require("./models/imgur");
    Q = require("q");
    io.use(function(socket, next) {
      return sessionStore(socket.request, socket.request.res, next);
    });
    return io.on("connection", function(socket) {
      socket.broadcast.emit("get_online_count", io.engine.clientsCount);
      socket.on("disconnect", function() {
        return socket.broadcast.emit("get_online_count", io.engine.clientsCount);
      });
      socket.on("load_chat_messages_for_room", function(arg) {
        var chat_id, room_id;
        chat_id = arg.chat_id, room_id = arg.room_id;
        return chat.load_messages_for_room({
          chat_id: chat_id,
          room_id: room_id
        }).then(function(messages) {
          return socket.emit("load_chat_messages_for_room", messages);
        });
      });
      socket.on("save_imgur", function(data) {
        return imgur.save(data).then(function(result) {
          return console.log("imgur data saved", result);
        });
      });
      socket.on("i_am_typing", function(from) {
        return socket.broadcast.emit("typing", from);
      });
      socket.on("save_chat_message", function(data) {
        return chat.save(data).then(function(result) {
          socket.emit("save_chat_message", result);
          return socket.broadcast.emit("save_chat_message", result);
        });
      });
      socket.on("load_topic", function(data) {
        return chat.load_topic(data).then(function(result) {
          return socket.emit("topic", result);
        });
      });
      socket.on("save_topic", function(data) {
        return chat.save_topic(data).then(function(result) {
          socket.emit("topic", result);
          return socket.broadcast.emit("topic", result);
        });
      });
      socket.on("load_rooms", function(data) {
        return rooms.get_rooms(data).then(function(result) {
          return socket.emit("rooms", result);
        });
      });
      socket.on("create_room", function(data) {
        return rooms.create(data).then(function(result) {
          socket.emit("room_created", result);
          return socket.broadcast.emit("room_created", result);
        });
      });
      return socket.on("get_online_count", function() {
        socket.emit("get_online_count", io.engine.clientsCount);
        return socket.broadcast.emit("get_online_count", io.engine.clientsCount);
      });
    });
  };

}).call(this);
