(function() {
  var Q, api, chat;

  Q = require('q');

  api = require('../models/api');

  chat = {};

  chat.save = function(data) {
    return api.createQueue('api.save_chat_message', data);
  };

  chat.load_messages_for_room = function(data) {
    return api.createQueue('api.load_chat_messages_for_room', data);
  };

  chat.load_topic = function(arg) {
    var chat_id, room_id;
    chat_id = arg.chat_id, room_id = arg.room_id;
    return api.createQueue('api.load_topic', {
      chat_id: chat_id,
      room_id: room_id
    });
  };

  chat.save_topic = function(data) {
    return api.createQueue('api.save_topic', data);
  };

  chat.getUrlDataRetry = function(url) {
    return api.createQueue('api.getUrlDataRetry', url);
  };

  chat.getOpenGraphData = function(url) {
    return api.createQueue('api.getOpenGraphData', url);
  };

  module.exports = chat;

}).call(this);
