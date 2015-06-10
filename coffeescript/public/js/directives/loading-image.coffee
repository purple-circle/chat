app = angular.module('app')
app.directive 'loadingImage', ->
  templateUrl: "directives/chat/loading-image.html"
  scope:
    url: "="
    urlText: "@"
    loaded: "="
  link: ($scope, element, attrs) ->
    $scope.loaded = false

    if !$scope.url && !$scope.urlText
      $scope.error = true
      return

    img = new Image()

    img.onerror = img.onabort = ->
      $scope.error = true
      $scope.loaded = false

    img.onload = ->
      $scope.error = false
      $scope.loaded = true

    $scope.imageUrl = $scope.url || $scope.urlText

    img.src = $scope.imageUrl
