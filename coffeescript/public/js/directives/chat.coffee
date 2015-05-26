app = angular.module('app')

app.directive "chat", ($rootScope, $timeout, $mdSidenav, $mdBottomSheet, $mdMedia, api, tabActive, animals, chatRooms) ->
  templateUrl: "directives/chat/chat.html"
  link: ($scope) ->
    $scope.chat_id = "chat-123"
    $scope.room_id = 1
    $scope.rooms = []
    $scope.message = ''
    $scope.tabVisible = true
    $scope.currentRoom = false

    $scope.peopleTyping = []
    $scope.peopleTypingTimeout = {}
    $scope.from = localStorage?.getItem("name") || "#{animals.getRandom()}-#{Math.ceil(Math.random()*100)}"
    ga('send', 'event', 'usernames', 'randomName', $scope.from)

    $scope.setActiveRoom = (room) ->
      if localStorage
        localStorage.setItem "selected-room", room.room_id

      if !room.$messagesFetched
        $timeout ->
          room.$messagesFetched = true
          $rootScope.$broadcast("getMessages", room.room_id)

      for g in $scope.rooms when g.$selected is true
        g.$selected = false

      room.$selected = true
      room.messages = 0

      $scope.currentRoom = room
      $scope.room_id = room.room_id


      if !room.$topicFetched
        room.$topicFetched = true
        getTopic(room.room_id)

      ga('send', 'event', 'rooms', 'setActiveRoom', room.name, room.room_id)


    unreadMessages = 0
    tabActive.check (status) ->
      $timeout ->
        $scope.tabVisible = status is "hidden"
        if !$scope.tabVisible
          unreadMessages = 0
          $rootScope.page_title = "Chat"


    listenToMessageNotifications = ->
      $rootScope.$on "message-notification", (event, room_id) ->
        if $scope.tabVisible
          unreadMessages++
          $rootScope.page_title = "(#{unreadMessages}) Chat"

        for g in $scope.rooms when g.$selected isnt true
          if g.room_id is room_id
            g.messages++

    joinRoom = (room_name) ->
      room_name = room_name.toLowerCase()
      for room in $scope.rooms when room.name.toLowerCase() is room_name
        ga('send', 'event', 'joinRoom', $scope.chat_id, room_name)
        $scope.setActiveRoom(room)

    getRooms = ->
      chatRooms
        .get()
        .then (rooms) ->
          $scope.rooms = rooms
          selected_room = $scope.rooms[0]

          previousRoom = localStorage?.getItem("selected-room")
          if previousRoom
            for room in $scope.rooms when room.room_id is Number previousRoom
              selected_room = room

          $scope.setActiveRoom(selected_room)

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
          ga('send', 'event', 'sharedImage', $scope.chat_id, possibleUrl[0])

      api.save_chat_messages(data)


    getMessageHistory = ->
      history = localStorage.getItem("message-history")
      if !history
        return []

      JSON.parse history

    globalHistory = getMessageHistory()
    historyLocation = globalHistory.length

    saveMessageHistory = (message) ->
      if !localStorage
        return

      history = localStorage.getItem("message-history") || "[]"
      history = JSON.parse(history)

      history.push(message)
      globalHistory = history

      historyLocation = history.length

      localStorage.setItem("message-history", JSON.stringify(history))


    $scope.browseHistory = (key) ->
      if key is "Up"

        if historyLocation < 0
          return

        historyLocation--

        if historyLocation < 0
          historyLocation = 0

        last = globalHistory[historyLocation]

        $scope.message = last
        ga('send', 'event', 'browseHistory', 'Up', $scope.room_id)

      if key is "Down"
        if historyLocation + 1 > globalHistory.length
          $scope.message = ''
          return

        historyLocation++
        last = globalHistory[historyLocation]
        $scope.message = last
        ga('send', 'event', 'browseHistory', 'Down', $scope.room_id)


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

      saveMessageHistory($scope.message)

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
        joinRoom(content.slice(1).join(" "))
        return true

      return false

    setTopic = (topic) ->
      ga('send', 'event', 'setTopic', $scope.chat_id, topic)
      $scope.currentRoom.topic = topic

      api
        .set_topic({topic, room_id: $scope.room_id, chat_id: $scope.chat_id})

    getTopic = (room_id) ->
      api
        .get_topic({room_id, chat_id: $scope.chat_id})
        .then (topic) ->
          $timeout ->
            for room in $scope.rooms when room.room_id is room_id
              room.topic = topic?.topic

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


    getRooms()
    listenToMessageNotifications()
    listenToTyping()
    listenToTopicChange()