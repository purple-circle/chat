Q = require("q")
api = require("../models/api")
chat = {}

chat.save = (data) ->
  api.createQueue("api.save_chat_message", data)

chat.load_messages = (chat_id) ->
  api.createQueue("api.load_chat_messages", chat_id)

module.exports = chat