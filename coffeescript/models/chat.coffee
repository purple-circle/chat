Q = require("q")
api = require("../models/api")
chat = {}

chat.save = (data) ->
  api.createQueue("api.save_chat_message", data)

chat.load_messages_for_room = (data) ->
  api.createQueue("api.load_chat_messages_for_room", data)

chat.load_topic = ({chat_id, room_id}) ->
  api.createQueue("api.load_topic", {chat_id, room_id})

chat.save_topic = (data) ->
  api.createQueue("api.save_topic", data)

module.exports = chat