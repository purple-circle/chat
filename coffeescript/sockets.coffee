require('newrelic')
module.exports = (server, sessionStore) ->
  io = require("socket.io").listen(server)
  chat = require("./models/chat")
  rooms = require("./models/rooms")
  imgur = require("./models/imgur")
  Q = require("q")
  require 'shelljs/global'

  io.use (socket, next) ->
    sessionStore socket.request, socket.request.res, next


  io.on "connection", (socket) ->
    socket.broadcast.emit "get_online_count", io.engine.clientsCount

    socket.on "disconnect", ->
      socket.broadcast.emit "get_online_count", io.engine.clientsCount

    socket.on "load_chat_messages_for_room", (data) ->
      chat
        .load_messages_for_room(data)
        .then (messages) ->

          urls = []
          urlsObject = {}
          for message in messages
            url = message.metadata?.urls[0]
            if url && !urlsObject[url]
              urlsObject[url] = true
              urls.push chat.getOpenGraphData(url)

          if urls.length
            Q.all(urls)
              .then (found_urls) ->
                for url in found_urls when url?
                  for message in messages when url.url in message.metadata?.urls
                    message.url_data = url

                socket.emit "load_chat_messages_for_room", messages
          else
            socket.emit "load_chat_messages_for_room", messages

    socket.on "save_imgur", (data) ->
      imgur.save(data)

    socket.on "i_am_typing", (from) ->
      socket.broadcast.emit "typing", from

    socket.on "save_chat_message", (data) ->
      chat
        .save(data)
        .then (result) ->

          if result.metadata?.urls
            chat
              .getUrlDataRetry(result.metadata?.urls[0])
              .then (url_data) ->
                data =
                  message: result
                  url_data: url_data

                socket.emit "url_data", data
                socket.broadcast.emit "url_data", data

          socket.emit "save_chat_message", result
          socket.broadcast.emit "save_chat_message", result

    socket.on "load_topic", (data) ->
      chat
        .load_topic(data)
        .then (result) ->
          socket.emit "topic", result

    socket.on "save_topic", (data) ->
      chat
        .save_topic(data)
        .then (result) ->
          socket.emit "topic", result
          socket.broadcast.emit "topic", result

    socket.on "load_rooms", (data) ->
      rooms
        .get_rooms(data)
        .then (result) ->
          socket.emit "rooms", result

    socket.on "create_room", (data) ->
      rooms
        .create(data)
        .then (result) ->
          socket.emit "room_created", result
          socket.broadcast.emit "room_created", result

    # socket.on "update_platform", ->
    #   if not which 'git'
    #     return

    #   # Run external tool synchronously
    #   shell_command = 'git pull && npm install'
    #   if (exec shell_command).code is 0
    #     socket.emit "update_platform", true
    #     socket.broadcast.emit "update_platform", true


    socket.on "get_online_count", ->
      socket.emit "get_online_count", io.engine.clientsCount
      socket.broadcast.emit "get_online_count", io.engine.clientsCount
