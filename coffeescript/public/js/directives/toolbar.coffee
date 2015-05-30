app = angular.module('app')
app.directive 'toolbar', ->
  restrict: 'E'
  scope:
    chatId: '='
    currentRoom: '='
  templateUrl: 'directives/chat/toolbar.html'