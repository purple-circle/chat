app = angular.module('app')

app.directive "messages", ($rootScope, $timeout, $interval, $mdDialog, $mdBottomSheet, $mdMedia, api) ->
  templateUrl: "directives/chat/messages.html"
  scope:
    room: "="
    chatId: "="
  link: ($scope) ->

    # TODO: rename, this is for message paging
    page = 0

    $scope.messages = {}
    $scope.whitespaces = [0..15]
    $scope.messagesFetched = {}
    $scope.youtubeOptions =
      autoplay: false

    $scope.peopleTyping = []
    $scope.peopleTypingTimeout = {}

    messagesOpened = new Date().getTime()

    $scope.openImage = (image) ->
      ga('send', 'event', 'openImage', $scope.chatId, image)
      $mdDialog.show
        templateUrl: 'directives/chat/image-preview.html'
        locals:
          image: image
        controller: ($scope, image) ->
          $scope.image = image

    $scope.openYoutubeVideo = (item) ->
      ga('send', 'event', 'openYoutubeVideo', $scope.chatId, item.youtubeId)
      item.videoOpened = true


    checkUserMentions = (user_mentions, from) ->
      if !user_mentions
        return false

      myUsername = api.getUsername()
      myUsername = myUsername.toLowerCase()

      for username in user_mentions
        name = username.toLowerCase()
        if name is myUsername and from isnt myUsername
          return true

      return false

    getMessageById = (room_id, id) ->
      for message in $scope.messages[room_id] when message._id is id
        return message

      return false


    processMessage = (row) ->
      if !$scope.messages[row.room_id]
        $scope.messages[row.room_id] = []

      # Prevent duplicate messages, hopefully
      if getMessageById(row.room_id, row._id)
        return false

      for message in $scope.messages[row.room_id] when message._id is row._id
        return false

      hasYoutubeUrl = api.isYoutubeUrl(row.original_message)
      if hasYoutubeUrl
        youtubeId = api.getYoutubeIdFromUrl(row.original_message)

      possibleUrls = api.stringHasUrl(row.original_message)
      if possibleUrls?[0] and api.urlIsImage(possibleUrls[0])
        api.testImage possibleUrls[0], ->

          message = getMessageById(row.room_id, row._id)
          message?.images = possibleUrls

      notify_user = checkUserMentions(row?.metadata?.user_mentions, row.from)
      if notify_user
        if new Date(row.created_at).getTime() > messagesOpened
          $rootScope.$broadcast("tab-beep")

      data =
        _id: row._id
        images: false
        room_id: row.room_id
        message: row.message
        createdAt: row.created_at
        from: row.from
        is_me: row.sid is yolosid
        color: api.intToARGB(api.hashCode(row.from))
        youtubeId: youtubeId
        notify_user: notify_user
        page: row.page
        isGreenText: row.original_message[0].trim() is ">"


      $scope.messages[row.room_id].push(data)


    processMessages = (room_id, messages, page_number) ->
      $scope.messagesFetched[room_id] = true

      for message in messages
        message.page = page_number
        processMessage(message)

      if page_number > 0
        $timeout ->
          last_message = messages.length - 1
          document.getElementsByClassName("page-#{page_number}")?[last_message]?.scrollIntoView()

    getMessages = (room_id, page_number) ->
      api
        .load_chat_messages_for_room({room_id, chat_id: $scope.chatId, page: page_number})
        .then (messages) ->
          processMessages(room_id, messages, page_number)


    $rootScope.$on "getMessages", (event, room_id) ->
      ga('send', 'event', 'messages', 'getMessages', $scope.chatId, room_id)
      getMessages(room_id, page)

    $rootScope.$on "load-more-messages", (event, room_id) ->
      ga('send', 'event', 'messages', 'load-more-messages', $scope.chatId, room_id)
      page++
      getMessages(room_id, page)

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


    $scope.openYoutubeDialog = (youtubeId) ->
      ga('send', 'event', 'openYoutubeDialog', $scope.chatId, youtubeId)
      $mdDialog.show
        templateUrl: 'directives/chat/youtube-dialog.html'
        locals:
          youtubeId: youtubeId
        controller: ($scope, youtubeId) ->
          $scope.youtubeId = youtubeId

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

    listenToMessages()
    listenToTyping()