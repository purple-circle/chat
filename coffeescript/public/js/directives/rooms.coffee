app = angular.module('app')

app.directive "rooms", ($rootScope, $timeout, $state, $stateParams, api, chatRooms) ->
  templateUrl: "directives/chat/rooms.html"
  scope:
    chatId: "="
  link: ($scope) ->
    $scope.rooms = []

    $scope.peopleTyping = {}
    $scope.peopleTypingTimeout = {}


    # TODO: move to room-typing directive
    listenToTyping = ->
      api
        .socket
        .on "typing", (data) ->
          if data.chatId isnt $scope.chatId
            return false

          myUsername = api.getUsername()
          if data.from is myUsername
            return false

          myUsername = api.getUsername()
          if data.from is myUsername
            return false

          if !$scope.peopleTyping[data.chatId]
            $scope.peopleTyping[data.chatId] = {}

          if !$scope.peopleTyping[data.chatId][data.roomId]
            $scope.peopleTyping[data.chatId][data.roomId] = true

          if $scope.peopleTypingTimeout[data.from]
            $timeout.cancel($scope.peopleTypingTimeout[data.from])

          $scope.peopleTypingTimeout[data.from] = $timeout ->
            $scope.peopleTyping[data.chatId][data.roomId] = false
          , 3000



    getTopic = (room_id) ->
      api
        .get_topic({room_id, chat_id: $scope.chatId})
        .then (topic) ->
          $timeout ->
            for room in $scope.rooms when room._id is room_id
              room.topic = topic?.topic

    getSelectedRoom = ->
      for room in $scope.rooms when room.$selected is true
        return room

      return false

    $scope.setActiveRoom = (room) ->
      if localStorage
        localStorage.setItem "selected-room", room._id

      if !room.$messagesFetched
        $timeout ->
          room.$messagesFetched = true
          $rootScope.$broadcast("getMessages", room._id)

      previousSelectedRoom = getSelectedRoom()
      previousSelectedRoom?.$selected = false

      room.$selected = true
      room.messages = 0

      # TODO: refactor to service
      $rootScope.$broadcast("currentRoom", room)


      if !room.$topicFetched
        room.$topicFetched = true
        getTopic(room._id)

      ga('send', 'event', 'rooms', 'setActiveRoom', room.name, room._id)

      if room._id isnt $stateParams.room_id
        $state.transitionTo "root.index.room", room_id: room._id

      $timeout ->
        document.getElementsByClassName("typing-container")?[0].scrollIntoView()


    listenToTopicChange = ->
      api
        .socket
        .on "topic", (topic) ->
          room = getSelectedRoom()
          room.topic = topic?.topic

    listenToMessageNotifications = ->
      $rootScope.$on "message-notification", (event, room_id) ->
        for room in $scope.rooms when room.$selected isnt true
          if room._id is room_id
            room.messages++

    joinRoom = (room_name) ->
      room_name = room_name.toLowerCase()
      for room in $scope.rooms when room.name.toLowerCase() is room_name
        ga('send', 'event', 'joinRoom', $scope.chatId, room_name)
        $scope.setActiveRoom(room)

    createFirstRoom = ->
      imgur_ids = [
        'h18WTm2b'
        'p8SNOcVb'
        'CfmbeXib'
        'JxtD1vcb'
        'RaKwQD7b'
        'aaVkYvxb'
      ]

      random = imgur_ids[Math.floor(Math.random() * imgur_ids.length)]

      icon = "http://i.imgur.com/#{random}.png"
      data =
        name: "Room #1"
        chat_id: $scope.chatId
        icon: icon

      api
        .create_room(data)
        .then (result) ->
          ga('send', 'event', 'createFirstRoom', $scope.chatId, result.name)
          getRooms()

    getRooms = ->
      chatRooms
        .get($scope.chatId)
        .then (rooms) ->
          if rooms.length is 0
            createFirstRoom()
            return

          for room in rooms
            room.messages = 0

          $scope.rooms = rooms
          selected_room = $scope.rooms[0]

          previousRoom = localStorage?.getItem("selected-room")
          if previousRoom
            for room in $scope.rooms when room._id is previousRoom
              selected_room = room

          $scope.setActiveRoom(selected_room)

      $rootScope.$on "joinRoom", (event, room_name) ->
        joinRoom(room_name)

      $rootScope.$on "room-created", (event, room) ->
        $scope.rooms.push(room)



    getRooms()
    listenToMessageNotifications()
    listenToTopicChange()
    listenToTyping()
