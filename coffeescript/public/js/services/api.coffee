app = angular.module('app')
app.factory 'api', ($q, youtubeEmbedUtils) ->
  socket = io()

  getYoutubeUrls = (url) ->
    # adapted from http://stackoverflow.com/a/5831191/1614967
    youtubeRegexp = ///https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com
      \S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*///ig
    url.match(youtubeRegexp)


  hashCode: (str) ->
    hash = 0
    i = 0
    while i < str.length
      hash = str.charCodeAt(i) + (hash << 5) - hash
      i++
    hash

  intToARGB: (i) ->
    h = (i >> 24 & 0xFF).toString(16) +
        (i >> 16 & 0xFF).toString(16) +
        (i >> 8 & 0xFF).toString(16) +
        (i & 0xFF).toString(16)
    h.substring 0, 6

  stringHasUrl: (str) ->
    url_regex = /(https?:\/\/[^\s]+)/g
    str.match url_regex

  urlIsImage: (url) ->
    url.match(/\.(jpeg|jpg|gif|png)$/) isnt null

  testImage: (url, callback) ->
    timeout = 5000
    timedOut = false
    timer = null
    img = new Image

    img.onerror = img.onabort = ->
      if !timedOut
        clearTimeout timer

    img.onload = ->
      if !timedOut
        clearTimeout timer
        callback url


    img.src = url
    timer = setTimeout ->
      timedOut = true
    , timeout


  socket: socket

  on: (event) ->
    deferred = $q.defer()
    socket.once event, deferred.resolve
    deferred.promise

  api_stats: ->
    socket.emit("api_stats")
    this.on("api_stats")

  get_online_count: ->
    socket.emit("get_online_count")
    this.on("get_online_count")

  findUser: (id) ->
    socket.emit("getuser", id)
    this.on("user")

  load_chat_messages_for_room: ({chat_id, room_id}) ->
    socket.emit("load_chat_messages_for_room", {chat_id, room_id})
    this.on("load_chat_messages_for_room")

  save_chat_messages: (data) ->
    socket.emit("save_chat_message", data)
    this.on("save_chat_message")


  getYoutubeUrls: getYoutubeUrls
  isYoutubeUrl: (url) ->
    getYoutubeUrls(url)?

  getYoutubeIdFromUrl: (url) ->
    youtubeEmbedUtils.getIdFromURL(getYoutubeUrls(url)?[0])

