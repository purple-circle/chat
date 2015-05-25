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

    getRooms = ->
      $scope.rooms = chatRooms.get()
      selected_room = $scope.rooms[0]

      previousRoom = localStorage?.getItem("selected-room")
      if previousRoom
        for room in $scope.rooms when room.room_id is Number previousRoom
          selected_room = room

      $scope.setActiveRoom(selected_room)

    createMessage = (data) ->
      if !data.message
        return

      data.room_id = $scope.room_id
      data.chat_id = $scope.chat_id

      possibleUrl = api.stringHasUrl(data.message)
      if possibleUrl?[0] and api.urlIsImage(possibleUrl[0])
        api.testImage possibleUrl[0], ->
          ga('send', 'event', 'sharedImage', $scope.chat_id, possibleUrl[0])

      api.save_chat_messages(data)

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

      $scope.message = ''
      createMessage(data)

    $scope.toggleLeft = ->
      $mdSidenav('left').toggle()

    $scope.closeLeft = ->
      $mdSidenav('left').close()

    $scope.setUsername = ->
      if !localStorage
        return false

      ga('send', 'event', 'setUsername', $scope.chat_id, $scope.from)
      localStorage.setItem "name", $scope.from


    getRooms()
    listenToMessageNotifications()