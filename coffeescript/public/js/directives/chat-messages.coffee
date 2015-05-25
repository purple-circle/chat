app = angular.module('app')

app.directive "messages", ($rootScope, $timeout, $interval, $mdSidenav, $mdBottomSheet, $mdMedia, api) ->
  templateUrl: "directives/chat/messages.html"
  scope:
    group: "="
    chatId: "="
  link: ($scope) ->

    $scope.room_id = 1

    $scope.messages = {}
    $scope.whitespaces = [0..15]
    $scope.youtubeOptions =
      autoplay: true


    hashCode = (str) ->
      hash = 0
      i = 0
      while i < str.length
        hash = str.charCodeAt(i) + (hash << 5) - hash
        i++
      hash


    intToARGB = (i) ->
      h = (i >> 24 & 0xFF).toString(16) +
          (i >> 16 & 0xFF).toString(16) +
          (i >> 8 & 0xFF).toString(16) +
          (i & 0xFF).toString(16)
      h.substring 0, 6


    $scope.openYoutubeVideo = (item) ->
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
        color: intToARGB(hashCode(row.from))
        youtubeId: youtubeId


      if !$scope.messages[row.room_id]
        $scope.messages[row.room_id] = []

      $scope.messages[row.room_id].push(data)


    processMessages = (messages) ->
      for message in messages
        processMessage(message)

    getMessages = ->
      ga('send', 'event', 'messages', 'getMessages', $scope.chatId, $scope.room_id)
      api
        .load_chat_messages($scope.chatId)
        .then processMessages


    listenToMessages = ->
      api
        .socket
        .on "save_chat_message", (message) ->
          processMessage(message)
          $rootScope.$broadcast("message-notification", message.room_id)


    getMessages()
    listenToMessages()

    $scope.showGridBottomSheet = ($event) ->
      $mdBottomSheet
        .show
          templateUrl: 'directives/chat/bottom-sheet.html'
          controller: 'GridBottomSheetCtrl'
          targetEvent: $event

