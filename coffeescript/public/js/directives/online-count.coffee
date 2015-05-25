app = angular.module('app')
app.directive 'onlineCount', ($timeout, api) ->
  restrict: 'E'
  scope:
    chatid: '@'
  link: ($scope, element, attrs) ->

    api.get_online_count()

    api
      .socket
      .on "get_online_count", (result) ->
        element.html result
