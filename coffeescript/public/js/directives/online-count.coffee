app = angular.module('app')
app.directive 'onlineCount', ($timeout, api) ->
  restrict: 'E'
  scope:
    chatId: '='
  link: ($scope, element, attrs) ->

    api.get_online_count()

    api
      .socket
      .on "get_online_count", (result) ->
        ga('send', 'event', 'onlineCount', $scope.chatId, result)
        element.html result
