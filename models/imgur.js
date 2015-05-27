(function() {
  var Q, api, imgur;

  Q = require("q");

  api = require("../models/api");

  imgur = {};

  imgur.save = function(data) {
    return api.createQueue("api.save_imgur", data);
  };

  module.exports = imgur;

}).call(this);
