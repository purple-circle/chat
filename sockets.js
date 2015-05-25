(function() {
  require('newrelic');

  module.exports = function(server, sessionStore) {
    var Q, chat, io;
    io = require("socket.io").listen(server);
    chat = require("./models/chat");
    Q = require("q");
    io.use(function(socket, next) {
      return sessionStore(socket.request, socket.request.res, next);
    });
    return io.on("connection", function(socket) {
      console.log('connection of active sessions: ', io.engine.clientsCount);
      socket.broadcast.emit("get_online_count", io.engine.clientsCount);
      socket.on("disconnect", function() {
        return socket.broadcast.emit("get_online_count", io.engine.clientsCount);
      });
      socket.on("load_chat_messages", function(chat_id) {
        return chat.load_messages(chat_id).then(function(messages) {
          return socket.emit("load_chat_messages", messages);
        });
      });
      socket.on("save_chat_message", function(data) {
        return chat.save(data).then(function(result) {
          socket.emit("save_chat_message", result);
          return socket.broadcast.emit("save_chat_message", result);
        });
      });
      return socket.on("get_online_count", function() {
        console.log('Number of active sessions: ', io.engine.clientsCount);
        socket.emit("get_online_count", io.engine.clientsCount);
        return socket.broadcast.emit("get_online_count", io.engine.clientsCount);
      });
    });
  };

}).call(this);
