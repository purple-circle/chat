(function() {
  var Q, api, chat;

  Q = require("q");

  api = require("../models/api");

  chat = {};

  chat.save = function(data) {
    return api.createQueue("api.save_chat_message", data);
  };

  chat.load_messages = function(chat_id) {
    return api.createQueue("api.load_chat_messages", chat_id);
  };

  module.exports = chat;

}).call(this);
