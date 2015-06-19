app = angular.module('app')
app.directive "messages", ($rootScope, $timeout, $interval, api) ->
  templateUrl: "directives/chat/messages.html"
  scope:
    room: "="
    chatId: "="
  link: ($scope) ->

    # TODO: rename, this is for message paging
    page = 0

    $scope.messages = {}
    $scope.messagesFetched = {}

    $scope.peopleTyping = []
    $scope.peopleTypingTimeout = {}

    messagesOpened = new Date().getTime()

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

      if api.hasYoutubeUrl(row.original_message)
        youtubeId = api.getYoutubeIdFromUrl(row.original_message)

      if api.hasVimeoUrl(row.original_message)
        vimeoId = api.getVimeoIdFromUrl(row.original_message)

      possibleUrls = api.stringHasUrl(row.original_message)
      if possibleUrls?[0] and api.urlIsImage(possibleUrls?[0])
        api
          .testImage(possibleUrls[0])
          .then ->
            message = getMessageById(row.room_id, row._id)
            message?.images = possibleUrls

      notify_user = checkUserMentions(row?.metadata?.user_mentions, row.from)
      if notify_user
        if new Date(row.created_at).getTime() > messagesOpened
          $rootScope.$broadcast("tab-beep")

      # TODO: data should be extended from row object
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
        vimeoId: vimeoId
        notify_user: notify_user
        page: row.page
        isGreenText: row.original_message[0].trim() is ">"
        url_data: row.url_data


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


    appendUrlDataToMessage = (data) ->
      message = getMessageById(data.message.room_id, data.message._id)
      if !message
        return false

      message.url_data = data.url_data

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

      api
        .socket
        .on "url_data", (url_data) ->
          appendUrlDataToMessage(url_data)


    listenToTyping = ->
      api
        .socket
        .on "typing", (data) ->
          myUsername = api.getUsername()
          if data.from is myUsername
            return false

          if $scope.peopleTyping.indexOf(data.from) is -1
            $scope.peopleTyping.push data.from

          if $scope.peopleTypingTimeout[data.from]
            $timeout.cancel($scope.peopleTypingTimeout[data.from])

          $scope.peopleTypingTimeout[data.from] = $timeout ->
            index = $scope.peopleTyping.indexOf(data.from)
            if index > -1
              $scope.peopleTyping.splice(index, 1)
          , 3000

    listenToMessages()
    listenToTyping()