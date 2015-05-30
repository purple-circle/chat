app = angular.module('app')
app.directive 'loader', ->
  restrict: 'E'
  scope:
    currentRoom: '='
  templateUrl: 'directives/chat/loader.html'