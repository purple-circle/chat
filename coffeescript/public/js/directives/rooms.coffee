app = angular.module('app')

app.directive "rooms", ($rootScope, $timeout, api, chatRooms) ->
  templateUrl: "directives/chat/rooms.html"
  scope:
    chatId: "="
  link: ($scope) ->
    $scope.rooms = []

    getTopic = (room_id) ->
      api
        .get_topic({room_id, chat_id: $scope.chatId})
        .then (topic) ->
          $timeout ->
            for room in $scope.rooms when room.room_id is room_id
              room.topic = topic?.topic

    getSelectedRoom = ->
      for room in $scope.rooms when room.$selected is true
        return room

      return false

    $scope.setActiveRoom = (room) ->
      if localStorage
        localStorage.setItem "selected-room", room.room_id

      if !room.$messagesFetched
        $timeout ->
          room.$messagesFetched = true
          $rootScope.$broadcast("getMessages", room.room_id)

      previousSelectedRoom = getSelectedRoom()
      previousSelectedRoom?.$selected = false

      room.$selected = true
      room.messages = 0

      # TODO: refactor to service
      $rootScope.$broadcast("currentRoom", room)


      if !room.$topicFetched
        room.$topicFetched = true
        getTopic(room.room_id)

      ga('send', 'event', 'rooms', 'setActiveRoom', room.name, room.room_id)


    listenToTopicChange = ->
      api
        .socket
        .on "topic", (topic) ->
          room = getSelectedRoom()
          room.topic = topic?.topic

    listenToMessageNotifications = ->
      $rootScope.$on "message-notification", (event, room_id) ->
        for room in $scope.rooms when room.$selected isnt true
          if room.room_id is room_id
            room.messages++

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

      $rootScope.$on "joinRoom", (event, room_name) ->
        joinRoom(room_name)



    getRooms()
    listenToMessageNotifications()
    listenToTopicChange()
