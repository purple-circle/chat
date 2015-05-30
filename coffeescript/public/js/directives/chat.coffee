app = angular.module('app')
app.directive "chat", ($rootScope, $mdSidenav) ->
  templateUrl: "directives/chat/chat.html"
  scope:
    chatId: "="
  link: ($scope) ->
    $scope.currentRoom = false

    # TODO: refactor to service
    $rootScope.$on "currentRoom", (event, room) ->
      $scope.currentRoom = room
      $scope.roomId = room._id

    $scope.toggleLeft = ->
      $mdSidenav('left').toggle()

    $scope.closeLeft = ->
      $mdSidenav('left').close()
