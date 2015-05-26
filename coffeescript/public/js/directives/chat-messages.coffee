app = angular.module('app')

app.directive "messages", ($rootScope, $timeout, $interval, $mdSidenav, $mdBottomSheet, $mdMedia, api) ->
  templateUrl: "directives/chat/messages.html"
  scope:
    room: "="
    chatId: "="
  link: ($scope) ->
    $scope.messages = {}
    $scope.whitespaces = [0..15]
    $scope.messagesFetched = {}
    $scope.youtubeOptions =
      autoplay: false

    $scope.openImage = (item) ->
      ga('send', 'event', 'openImage', $scope.chatId, item.hasImage)

    $scope.openYoutubeVideo = (item) ->
      ga('send', 'event', 'openYoutubeVideo', $scope.chatId, item.youtubeId)
      item.videoOpened = true


    processMessage = (row) ->
      hasYoutubeUrl = api.isYoutubeUrl(row.original_message)
      if hasYoutubeUrl
        youtubeId = api.getYoutubeIdFromUrl(row.original_message)

      possibleUrl = api.stringHasUrl(row.original_message)
      if possibleUrl?[0] and api.urlIsImage(possibleUrl[0])
        api.testImage possibleUrl[0], ->
          for message in $scope.messages[row.room_id] when message._id is row._id
            message.hasImage = possibleUrl[0]

      data =
        _id: row._id
        hasImage: false
        room_id: row.room_id
        message: row.message
        createdAt: row.created_at
        from: row.from
        is_me: row.sid is yolosid
        color: api.intToARGB(api.hashCode(row.from))
        youtubeId: youtubeId


      if !$scope.messages[row.room_id]
        $scope.messages[row.room_id] = []

      $scope.messages[row.room_id].push(data)


    processMessages = (room_id, messages) ->
      $scope.messagesFetched[room_id] = true

      for message in messages
        processMessage(message)

    getMessages = (room_id) ->
      api
        .load_chat_messages_for_room({room_id, chat_id: $scope.chatId})
        .then (messages) ->
          processMessages(room_id, messages)


    $rootScope.$on "getMessages", (event, room_id) ->
      ga('send', 'event', 'messages', 'getMessages', $scope.chatId, room_id)
      getMessages(room_id)

    listenToMessages = ->
      api
        .socket
        .on "save_chat_message", (message) ->
          processMessage(message)
          $rootScope.$broadcast("message-notification", message.room_id)

    $scope.showGridBottomSheet = ($event) ->
      ga('send', 'event', 'click', 'showGridBottomSheet', $scope.chatId)
      $mdBottomSheet
        .show
          templateUrl: 'directives/chat/bottom-sheet.html'
          controller: 'GridBottomSheetCtrl'
          targetEvent: $event


    listenToMessages()