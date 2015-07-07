app = angular.module('app')
app.directive 'toolbar', ($mdSidenav) ->
  restrict: 'E'
  scope:
    chatId: '='
    currentRoom: '='
  templateUrl: 'directives/chat/toolbar.html'
  link: ($scope) ->

    $scope.toggleLeft = ->
      $mdSidenav('left').toggle()

    $scope.closeLeft = ->
      $mdSidenav('left').close()
