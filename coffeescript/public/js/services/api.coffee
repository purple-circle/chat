app = angular.module('app')

app.directive 'fileModel', ($parse) ->

  restrict: 'A'
  link: (scope, element, attrs) ->
    model = $parse(attrs.fileModel)
    modelSetter = model.assign
    element.bind 'change', ->
      scope.$apply ->
        modelSetter scope, element[0].files[0]


app.factory 'api', ($q, $http, youtubeEmbedUtils) ->
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

  i_am_typing: (from) ->
    socket.emit("i_am_typing", from)

  api_stats: ->
    socket.emit("api_stats")
    this.on("api_stats")

  get_topic: ({chat_id, room_id}) ->
    socket.emit("load_topic", {chat_id, room_id})
    this.on("topic")

  set_topic: (data) ->
    socket.emit("save_topic", data)

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

  upload_to_imgur: (file) ->
    deferred = $q.defer()
    if !file or !file.type.match(/image.*/)
      deferred.reject "not image or no file"
      return deferred.promise

    fd = new FormData()
    fd.append 'image', file

    xhr = new XMLHttpRequest()
    xhr.open 'POST', 'https://api.imgur.com/3/image.json'
    xhr.setRequestHeader 'Authorization', 'Client-ID 3631cecbf2bf2cf'
    xhr.send fd

    xhr.onload = ->
      result = JSON.parse(xhr.responseText)
      deferred.resolve result

    deferred.promise