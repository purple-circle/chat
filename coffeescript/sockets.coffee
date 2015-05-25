require('newrelic')
module.exports = (server, sessionStore) ->
  io = require("socket.io").listen(server)
  chat = require("./models/chat")
  Q = require("q")

  io.use (socket, next) ->
    sessionStore socket.request, socket.request.res, next


  io.on "connection", (socket) ->
    socket.broadcast.emit "get_online_count", io.engine.clientsCount

    socket.on "disconnect", ->
      socket.broadcast.emit "get_online_count", io.engine.clientsCount

    socket.on "load_chat_messages_for_room", ({chat_id, room_id}) ->
      chat
        .load_messages_for_room({chat_id, room_id})
        .then (messages) ->
          socket.emit "load_chat_messages_for_room", messages


    socket.on "save_chat_message", (data) ->
      chat
        .save(data)
        .then (result) ->
          socket.emit "save_chat_message", result
          socket.broadcast.emit "save_chat_message", result

    socket.on "get_online_count", ->
      socket.emit "get_online_count", io.engine.clientsCount
      socket.broadcast.emit "get_online_count", io.engine.clientsCount
