Q = require("q")
api = require("../models/api")
room = {}

room.create = (data) ->
  api.createQueue("api.create_room", data)

module.exports = room