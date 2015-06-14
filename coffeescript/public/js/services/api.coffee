app = angular.module('app')
app.factory 'api', ($q, youtubeEmbedUtils, imgurUpload, messageHistory, animals, testImage, notification) ->
  socket = io()

  getYoutubeUrls = (url) ->
    # adapted from http://stackoverflow.com/a/5831191/1614967
    youtubeRegexp = ///https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com
      \S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*///ig
    url.match(youtubeRegexp)

  getVimeoUrls = (url) ->
    vimeoRegexp = ///https?:\/\/(?:www\.|player\.)?vimeo.com\/
    (?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/
      video\/|video\/|)(\d+)(?:$|\/|\?)///

    url.match(vimeoRegexp)

  messageHistory: messageHistory
  urlIsImage: testImage.urlIsImage
  testImage: testImage.test
  socket: socket
  getYoutubeUrls: getYoutubeUrls
  notification: notification

  hasVimeoUrl: (url) ->
    getVimeoUrls(url)?

  getVimeoIdFromUrl: (url) ->
    getVimeoUrls(url)?[3]

  cameraIsSupported: ->
    cameraSupported = false

    if navigator.getUserMedia
     cameraSupported = true

    else if navigator.webkitGetUserMedia
      cameraSupported = true

    else if navigator.mozGetUserMedia
      cameraSupported = true

    cameraSupported

  saveImgurData: (data) ->
    socket.emit("save_imgur", data)

  getUsername: ->
    name = localStorage?.getItem("name") || "#{animals.getRandom()}-#{Math.ceil(Math.random()*100)}"
    ga('send', 'event', 'usernames', 'randomName', name)
    name

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

  create_room: (data) ->
    socket.emit("create_room", data)
    this.on("room_created")

  load_rooms: (data) ->
    socket.emit("load_rooms", data)
    this.on("rooms")

  get_online_count: ->
    socket.emit("get_online_count")
    this.on("get_online_count")

  load_chat_messages_for_room: (data) ->
    socket.emit("load_chat_messages_for_room", data)
    this.on("load_chat_messages_for_room")

  save_chat_messages: (data) ->
    socket.emit("save_chat_message", data)
    this.on("save_chat_message")

  update_platform: ->
    socket.emit("update_platform")
    this.on("update_platform")

  hasYoutubeUrl: (url) ->
    getYoutubeUrls(url)?

  getYoutubeIdFromUrl: (url) ->
    youtubeEmbedUtils.getIdFromURL(getYoutubeUrls(url)?[0])

  upload_to_imgur: (file, options) ->
    imgurUpload.setClientId("3631cecbf2bf2cf")
    imgurUpload.upload file, options

  signup: (data) ->
    socket.emit("signup", data)
    this.on("signup")