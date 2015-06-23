app = angular.module("app")
app.service "commands", ($rootScope, $mdDialog, api) ->

  setTopic = (topic, chat_id, room_id) ->
    ga('send', 'event', 'setTopic', chat_id, topic)

    api
      .set_topic({topic, room_id, chat_id})

  create_room = (name, chat_id, from) ->
    random = api.getRandomImgurId()

    icon = "http://i.imgur.com/#{random}.png"
    data =
      name: name
      chat_id: chat_id
      sid: yolosid
      created_by: from
      icon: icon

    api
      .create_room(data)
      .then (result) ->
        ga('send', 'event', 'createdRoom', chat_id, result.name)
        $rootScope.$broadcast("room-created", result)
        check({message: "/join #{result.name}"})

  check = (data) ->
    message = data.message
    if message[0] isnt "/"
      return false

    content = message.split(" ")
    command = content[0].replace("/", "")

    if command is "topic"
      setTopic(content.slice(1).join(" "), data.chat_id, data.room_id)
      return true

    if command is "join" or command is "j"
      $rootScope.$broadcast("joinRoom", content.slice(1).join(" "))
      return true

    if command is "create"
      create_room(content.slice(1).join(" "), data.chat_id, data.from)
      return true

    if command is "help"
      $mdDialog
        .show
          templateUrl: 'directives/chat/help.html'
          controller: 'simpleDialog'

      return true

    if command is "register" or command is "signup"
      $mdDialog
        .show
          templateUrl: 'directives/chat/signup-dialog.html'
          controller: 'simpleDialog'

      return true

    if command is "login" or command is "signin"
      $mdDialog
        .show
          templateUrl: 'directives/chat/login-dialog.html'
          controller: 'simpleDialog'

      return true

    # if command is "update_platform"
    #   console.log "Updating platform"
    #   api
    #     .update_platform()
    #     .then ->
    #       console.log "Platform up to date"
    #       window.location.reload()
    #   return true

    return false

  {check}