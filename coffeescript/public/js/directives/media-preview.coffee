app = angular.module('app')
app.directive 'mediaPreview', ($mdDialog, asyncJsLoad) ->
  templateUrl: 'directives/chat/media-preview.html'
  scope:
    message: '='
  link: ($scope) ->
    $scope.loaded = false

    $scope.youtubeOptions =
      autoplay: false

    if $scope.message.youtubeId and not window.YT?
      asyncJsLoad.addYoutube()

    $scope.openImage = (image) ->
      ga('send', 'event', 'openImage', $scope.chatId, image)
      $mdDialog.show
        templateUrl: 'directives/chat/image-preview.html'
        locals:
          image: image
        controller: ($scope, image) ->
          $scope.image = image
          $scope.close = ->
            $mdDialog.cancel()

    $scope.openOpenGraphImage = (image, type) ->
      data =
        chatId: $scope.chatId
        image: image

      ga('send', 'event', 'openOpenGraphImage', type, JSON.stringify(data))

    $scope.openYoutubeVideo = (item) ->
      ga('send', 'event', 'openYoutubeVideo', $scope.chatId, item.youtubeId)
      item.videoOpened = true


    $scope.openYoutubeDialog = (youtubeId) ->
      ga('send', 'event', 'openYoutubeDialog', $scope.chatId, youtubeId)
      $mdDialog.show
        templateUrl: 'directives/chat/youtube-dialog.html'
        locals:
          youtubeId: youtubeId
        controller: ($scope, youtubeId) ->
          $scope.youtubeId = youtubeId
