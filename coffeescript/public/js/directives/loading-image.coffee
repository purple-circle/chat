app = angular.module('app')
app.directive 'loadingImage', ->
  templateUrl: "directives/chat/loading-image.html"
  scope:
    url: "="
  link: ($scope, element, attrs) ->
    $scope.loaded = false
    img = new Image()

    img.onerror = img.onabort = ->
      $scope.loaded = false

    img.onload = ->
      $scope.loaded = true

    img.src = $scope.url

