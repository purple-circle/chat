app = angular.module('app')
app.directive 'chat', ($rootScope) ->
  templateUrl: 'directives/chat/chat.html'
  scope:
    chatId: '='
    roomId: '='
  link: ($scope) ->
    $scope.currentRoom = false

    # TODO: refactor to service
    $rootScope.$on 'currentRoom', (event, room) ->
      $scope.currentRoom = room
      $scope.roomId = room._id

    $scope.loadMore = ->
      $rootScope.$broadcast('load-more-messages', $scope.roomId)