Q = require("q")
api = require("../models/api")
room = {}

room.create = (data) ->
  api.createQueue("api.create_room", data)

room.get_rooms = (data) ->
  api.createQueue("api.get_rooms", data)

module.exports = room