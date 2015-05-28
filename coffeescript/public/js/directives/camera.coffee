app = angular.module('app')
app.directive 'camera', ($mdDialog, api) ->
  templateUrl: "directives/chat/camera.html"
  restrict: 'E'
  link: ($scope, element, attrs) ->
    $scope.imageTaken = false
    $scope.readyToTakeImage = false

    # Grab elements, create settings, etc.
    canvas = document.getElementById('canvas')
    context = canvas.getContext('2d')
    video = document.getElementById('video')
    videoObj =
      'video': true

    errBack = (error) ->
      console.log 'Video capture error: ', error.code

    convertCanvasToImage = (canvas) ->
      image = new Image

      try
        picture = canvas.toDataURL('image/jpeg', 0.9).split(',')[1]
      catch e
        picture = canvas.toDataURL().split(',')[1]

      picture

    setup = (stream) ->
      window.camera = stream
      video.stream = stream
      video.play()
      $scope.readyToTakeImage = true

    start = ->
      # Put video listeners into place
      if navigator.getUserMedia
        # Standard
        navigator.getUserMedia videoObj, (stream) ->
          video.src = stream
          setup(stream)
        , errBack

      else if navigator.webkitGetUserMedia
        # WebKit-prefixed
        navigator.webkitGetUserMedia videoObj, (stream) ->
          if window.URL
            video.src = window.URL.createObjectURL(stream)
          else
            video.src = window.webkitURL.createObjectURL(stream)
          setup(stream)
        , errBack

      else if navigator.mozGetUserMedia
        # Firefox-prefixed
        navigator.mozGetUserMedia videoObj, (stream) ->
          video.src = window.URL.createObjectURL(stream)
          setup(stream)
        , errBack


    $scope.retake = ->
      start()
      $scope.imageTaken = false

    $scope.send = ->
      $scope.sending = true
      image = convertCanvasToImage(canvas)
      api
        .upload_to_imgur(image, {canvas: true})
        .then (imgur) ->
          $scope.sending = false
          $mdDialog.hide imgur


    $scope.takePhoto = ->
      $scope.imageTaken = true
      context.drawImage video, 0, 0, 640, 480
      video.stream.stop()


    if api.cameraIsSupported()
      start()

