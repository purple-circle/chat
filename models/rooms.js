(function() {
  var Q, api, room;

  Q = require("q");

  api = require("../models/api");

  room = {};

  room.create = function(data) {
    return api.createQueue("api.create_room", data);
  };

  module.exports = room;

}).call(this);
