app = angular.module('app')

app.directive "chat", ($rootScope, $timeout, $mdSidenav, $mdBottomSheet, $mdMedia, api, animals) ->
  templateUrl: "directives/chat/chat.html"
  link: ($scope) ->
    $scope.chat_id = "chat-123"
    $scope.room_id = 1
    $scope.rooms = []
    $scope.users = []
    $scope.message = ''

    $scope.currentUser = false
    $scope.currentRoom = false

    $scope.setActiveRoom = (room) ->
      if !room.$messagesFetched
        $timeout ->
          room.$messagesFetched = true
          $rootScope.$broadcast("getMessages", room.room_id)

      room.messages = 0
      $scope.currentRoom = room
      for g in $scope.rooms when g.$selected is true
        g.$selected = false

      room.$selected = true
      $scope.room_id = room.room_id
      ga('send', 'event', 'rooms', 'setActiveRoom', room.name, room.room_id)


    listenToMessageNotifications = ->
      $rootScope.$on "message-notification", (event, room_id) ->

        for g in $scope.rooms when g.$selected isnt true
          if g.room_id is room_id
            g.messages++


    listenToMessageNotifications()


    $scope.from = "#{animals.getRandom()}-#{Math.ceil(Math.random()*100)}"
    ga('send', 'event', 'usernames', 'randomName', $scope.from)

    getRooms = ->
      $scope.rooms = [
        {
          room_id: 1
          name: "Room #1"
          messages: 0
          icon: 'http://i.imgur.com/h18WTm2b.jpg'
        },{
          room_id: 2
          name: "Room #2"
          messages: 0
          icon: 'http://i.imgur.com/p8SNOcVb.jpg'
        },{
          room_id: 3
          name: "Room #666"
          messages: 0
          icon: 'http://i.imgur.com/CfmbeXib.jpg'
        },{
          room_id: 4
          name: "Politics"
          messages: 0
          icon: 'http://i.imgur.com/JxtD1vcb.jpg'
        },{
          room_id: 5
          name: "Pictures of cats"
          messages: 0
          icon: 'http://i.imgur.com/RaKwQD7b.jpg'
        },{
          room_id: 6
          name: "Best of Youtube"
          messages: 0
          icon: 'http://i.imgur.com/aaVkYvxb.png'
        },{
          room_id: 7
          name: "Usersub"
          messages: 0
          icon: 'http://i.imgur.com/YQwZUiJb.gif'
        }
      ]
      $scope.setActiveRoom($scope.rooms[0])

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


    getRooms()


    $scope.createRoom = ->
      if !$scope.roomName
        return

      data =
        name: $scope.roomName
        created_by: $scope.currentUser


    $scope.toggleTimeSpent = ->
      $scope.showTimeSpent = !$scope.showTimeSpent

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

