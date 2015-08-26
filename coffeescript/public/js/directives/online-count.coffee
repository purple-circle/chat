app = angular.module('app')
app.directive 'onlineCount', ($timeout, api) ->
  restrict: 'E'
  scope:
    chatId: '='
    roomId: '='
  link: ($scope, element, attrs) ->
    data =
      chatId: $scope.chatId
      roomId: $scope.roomId

    api.get_online_count(data)

    api
      .socket
      .on 'get_online_count', (result) ->
        ga('send', 'event', 'onlineCount', $scope.chatId, result)
        element.html result
