app = angular.module('app')

app.directive "chat", ($rootScope, $timeout, $mdSidenav, api, tabActive) ->
  templateUrl: "directives/chat/chat.html"
  link: ($scope) ->
    $scope.chat_id = "chat-123"
    $scope.room_id = 1

    $scope.message = ''
    $scope.tabVisible = true
    $scope.currentRoom = false

    $scope.peopleTyping = []
    $scope.peopleTypingTimeout = {}
    $scope.from = api.getUsername()

    unreadMessages = 0
    tabActive.check (status) ->
      $timeout ->
        $scope.tabVisible = status is "hidden"
        if !$scope.tabVisible
          unreadMessages = 0
          $rootScope.page_title = "Chat"


    # TODO: refactor to service
    $rootScope.$on "currentRoom", (event, room) ->
      $scope.currentRoom = room
      $scope.room_id = room.room_id

    listenToMessageNotifications = ->
      $rootScope.$on "message-notification", (event, room_id) ->
        if $scope.tabVisible
          unreadMessages++
          $rootScope.page_title = "(#{unreadMessages}) Chat"

    createMessage = (data) ->
      if !data.message
        return

      if checkCommands(data.message)
        return

      data.room_id = $scope.room_id
      data.chat_id = $scope.chat_id

      possibleUrl = api.stringHasUrl(data.message)
      if possibleUrl?[0] and api.urlIsImage(possibleUrl[0])
        api.testImage possibleUrl[0], ->
          ga('send', 'event', 'sharedImage', data.chat_id, possibleUrl[0])

      api.save_chat_messages(data)


    $scope.browseHistory = (key) ->
      if key is "Up"
        message = api.messageHistory.up($scope.room_id)
        if message
          $scope.message = message

      if key is "Down"
        $scope.message = api.messageHistory.down($scope.room_id)


    $scope.saveMessage = ->
      if !$scope.message
        ga('send', 'event', 'messages', 'empty saveMessage', $scope.room_id)
        return

      ga('send', 'event', 'messages', 'saveMessage', $scope.room_id)

      data =
        chat_id: $scope.chat_id
        room_id: $scope.room_id
        message: $scope.message
        from: $scope.from
        sid: yolosid

      api.messageHistory.saveMessageHistory($scope.message)

      $scope.message = ''
      createMessage(data)

    $scope.toggleLeft = ->
      $mdSidenav('left').toggle()

    $scope.closeLeft = ->
      $mdSidenav('left').close()

    $scope.i_am_typing = ->
      api.i_am_typing($scope.from)

    listenToTyping = ->
      api
        .socket
        .on "typing", (from) ->

          if $scope.peopleTyping.indexOf(from) is -1
            $scope.peopleTyping.push from

          if $scope.peopleTypingTimeout[from]
            $timeout.cancel($scope.peopleTypingTimeout[from])

          $scope.peopleTypingTimeout[from] = $timeout ->
            index = $scope.peopleTyping.indexOf(from)
            if index > -1
              $scope.peopleTyping.splice(index, 1)
          , 3000

    $scope.setUsername = ->
      if !localStorage
        return false

      ga('send', 'event', 'setUsername', $scope.chat_id, $scope.from)
      localStorage.setItem "name", $scope.from


    checkCommands = (message) ->
      if message[0] isnt "/"
        return false

      content = message.split(" ")
      command = content[0].replace("/", "")

      if command is "topic"
        setTopic(content.slice(1).join(" "))
        return true

      if command is "join" or command is "j"
        $rootScope.$broadcast("joinRoom", content.slice(1).join(" "))
        return true

      return false

    setTopic = (topic) ->
      ga('send', 'event', 'setTopic', $scope.chat_id, topic)
      $scope.currentRoom.topic = topic

      api
        .set_topic({topic, room_id: $scope.room_id, chat_id: $scope.chat_id})


    listenToTopicChange = ->
      api
        .socket
        .on "topic", (topic) ->
          $scope.currentRoom.topic = topic?.topic


    $scope.selectFile = ->
      document.getElementById("image-upload").click()
      document.getElementsByClassName("select-file-container")[0].blur()

    $scope.uploadFile = (element) ->
      if !element?.files?[0]
        return

      api
        .upload_to_imgur(element.files[0])
        .then (result) ->
          angular.element(element).val(null)

          $scope.message = result.data.link
          $scope.saveMessage()


    listenToMessageNotifications()
    listenToTyping()
    listenToTopicChange()