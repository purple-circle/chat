app = angular.module('app')
app.directive 'messageForm', ($rootScope, $timeout, $mdSidenav, $mdDialog, api, tabActive, commands) ->
  restrict: 'E'
  scope:
    chatId: '='
    roomId: '='
    currentRoom: '='
  templateUrl: 'directives/chat/message-form.html'
  link: ($scope) ->

    # TODO: refactor to service
    $rootScope.$on 'currentRoom', (event, room) ->
      $scope.currentRoom = room
      $scope.roomId = room._id

    $scope.message = ''
    $scope.from = api.getUsername()
    $scope.cameraSupported = api.cameraIsSupported()
    $scope.uploadProgress = 0
    $scope.showProgress = false

    hideProgressBarTimeout = null

    createMessage = (data) ->
      if not data.message
        return

      if not data.from
        return

      data.room_id = $scope.roomId
      data.chat_id = $scope.chatId

      if commands.check(data)
        return

      possibleUrl = api.stringHasUrl(data.message)
      if possibleUrl?[0] and api.urlIsImage(possibleUrl[0])
        api.testImage possibleUrl[0], ->
          ga('send', 'event', 'sharedImage', data.chat_id, possibleUrl[0])

      api.save_chat_messages(data)


    $scope.browseHistory = (key) ->
      if key is 'Up'
        message = api.messageHistory.up($scope.roomId)
        if message
          $timeout ->
            $scope.message = message

      if key is 'Down'
        $timeout ->
          $scope.message = api.messageHistory.down($scope.roomId)


    $scope.saveMessage = ->
      $scope.focusUsername = false
      $scope.focusMessage = false

      if not $scope.from
        api.notification.set('Please set a username')
        $scope.focusUsername = true
        ga('send', 'event', 'messages', 'empty username', $scope.roomId)
        return

      if not $scope.message
        api.notification.set('No empty messages :<')
        $scope.focusMessage = true
        ga('send', 'event', 'messages', 'empty saveMessage', $scope.roomId)
        return

      ga('send', 'event', 'messages', 'saveMessage', $scope.roomId)

      data =
        chat_id: $scope.chatId
        room_id: $scope.roomId
        message: $scope.message
        from: $scope.from
        sid: yolosid

      api.messageHistory.saveMessageHistory($scope.message)

      $scope.message = ''
      createMessage(data)


    $scope.i_am_typing = ->
      data =
        from: $scope.from,
        chatId: $scope.chatId
        roomId: $scope.roomId
      api.i_am_typing(data)


    $scope.setUsername = ->
      if not localStorage?
        return false

      ga('send', 'event', 'setUsername', $scope.chatId, $scope.from)
      localStorage.setItem 'name', $scope.from

    postImage = (imgur) ->
      data =
        data: imgur.data
        chat_id: $scope.chatId
        room_id: $scope.roomId
        sid: yolosid

      api.saveImgurData(data)

      $scope.message = imgur.data.link
      $scope.saveMessage()

    $scope.useCamera = ->
      ga('send', 'event', 'useCamera', $scope.chatId, $scope.roomId)
      $mdDialog
        .show
          templateUrl: 'directives/chat/camera-dialog.html'
        .then (result) ->
          postImage(result)
          ga('send', 'event', 'used camera, saved picture', $scope.chatId, $scope.roomId)

        , ->
          window.camera?.stop()

    $scope.selectFile = ->
      document.getElementById('image-upload').click()
      document.getElementsByClassName('select-file-container')[0].blur()


    hideProgressBar = ->
      if hideProgressBarTimeout
        $timeout.cancel(hideProgressBarTimeout)

      hideProgressBarTimeout = $timeout ->
        $scope.showProgress = false
      , 1000

    $scope.uploadFile = (element) ->
      if not element?.files?[0]?
        return

      ga('send', 'event', 'uploaded image', $scope.chatId, $scope.roomId)

      upload_success = (result) ->
        postImage(result)
          .then ->
            angular.element(element).val(null)
            hideProgressBar()

      upload_error = (err) ->
        console.log 'err', err
        ga('send', 'event', 'image upload error', $scope.chatId, JSON.stringify(err))
        hideProgressBar()

      upload_notify = (progress) ->
        $timeout ->
          $scope.uploadProgress = progress

      $scope.showProgress = true
      $scope.uploadProgress = 0

      api
        .upload_to_imgur(element.files[0])
        .then upload_success, upload_error, upload_notify

