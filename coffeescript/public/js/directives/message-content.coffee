app = angular.module('app')
app.directive "messageContent", ->
  templateUrl: "directives/chat/message-content.html"
  scope:
    message: "="
  link: ($scope) ->
    $scope.whitespaces = [0..15]