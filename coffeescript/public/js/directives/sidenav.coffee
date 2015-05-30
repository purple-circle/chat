app = angular.module('app')
app.directive 'sidenav', ->
  restrict: 'E'
  scope:
    chatId: '='
  templateUrl: 'directives/chat/sidenav.html'
