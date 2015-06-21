app = angular.module('app')
app.directive 'bouncyLoader', ->
  restrict: 'E'
  templateUrl: 'directives/chat/bouncy-loader.html'
