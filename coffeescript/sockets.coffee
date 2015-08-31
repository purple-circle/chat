require('newrelic')
module.exports = (server, sessionStore) ->
  io = require('socket.io').listen(server)
  api = require('./models/api')
  chat = require('./models/chat')
  rooms = require('./models/rooms')
  imgur = require('./models/imgur')
  users = require('./models/user')
  Q = require('q')

  io.use (socket, next) ->
    sessionStore socket.request, socket.request.res, next

  default_chat_id = 'chat-123'

  io.on 'connection', (socket) ->
    socket.join(default_chat_id)

    broadcastClientCount = (data) ->
      chatId = data?.chatId or default_chat_id
      roomData = {}
      if io.sockets.adapter.rooms[chatId]
        roomData = io.sockets.adapter.rooms[chatId]

      clientsCount = Object.keys(roomData).length
      io.to(chatId).emit 'get_online_count', clientsCount


    socket.on 'disconnect', ->
      broadcastClientCount(null)

    socket.on 'load_chat_messages_for_room', (data) ->
      chat
        .load_messages_for_room(data)
        .then (messages) ->

          urls = []
          urlsObject = {}
          for message in messages when message.metadata?.urls?[0]
            url = message.metadata?.urls?[0]
            if url? && !urlsObject[url]
              urlsObject[url] = true
              urls.push chat.getOpenGraphData(url)

          if urls.length > 0
            Q.all(urls)
              .then (found_urls) ->
                for url in found_urls when url?
                  for message in messages when url.url is message.metadata?.urls?[0]
                    message.url_data = url

                socket.emit 'load_chat_messages_for_room', messages
              , (err) ->
                socket.emit 'load_chat_messages_for_room', messages
          else
            socket.emit 'load_chat_messages_for_room', messages

    socket.on 'save_imgur', (data) ->
      imgur.save(data)

    socket.on 'i_am_typing', (data) ->
      io.to(default_chat_id).emit 'typing', data

    socket.on 'save_chat_message', (data) ->
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

                socket.emit 'url_data', data
                socket.broadcast.emit 'url_data', data

          io.to(default_chat_id).emit 'save_chat_message', result

    socket.on 'load_topic', (data) ->
      chat
        .load_topic(data)
        .then (result) ->
          socket.emit 'topic', result

    socket.on 'save_topic', (data) ->
      chat
        .save_topic(data)
        .then (result) ->
          io.to(default_chat_id).emit 'topic', result

    socket.on 'load_rooms', (data) ->
      rooms
        .get_rooms(data)
        .then (result) ->
          io.to(default_chat_id).emit 'rooms', result

    socket.on 'create_room', (data) ->
      rooms
        .create(data)
        .then (result) ->
          io.to(default_chat_id).emit 'room_created', result

    socket.on 'signup', (data) ->
      error = (error) ->
        socket.emit 'signup_error', {error}

      success = (account) ->
        socket.emit 'signup', {account}

      users
        .localSignup(data)
        .then success, error

    socket.on 'login', (data) ->
      error = (error) ->
        socket.emit 'login_error', {error}

      success = (account) ->
        socket.emit 'login', {account}

      users
        .login(data)
        .then success, error

    socket.on 'get_online_count', (data) ->
      broadcastClientCount(data)

    socket.on 'api_stats', ->
      api
        .api_stats()
        .then (result) ->
          socket.emit 'api_stats', result

