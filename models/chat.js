(function() {
  var Q, api, chat;

  Q = require("q");

  api = require("../models/api");

  chat = {};

  chat.save = function(data) {
    return api.createQueue("api.save_chat_message", data);
  };

  chat.load_messages_for_room = function(arg) {
    var chat_id, room_id;
    chat_id = arg.chat_id, room_id = arg.room_id;
    return api.createQueue("api.load_chat_messages_for_room", {
      chat_id: chat_id,
      room_id: room_id
    });
  };

  module.exports = chat;

}).call(this);
