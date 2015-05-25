app = angular.module('app')
app.directive 'clock', (dateFilter, $timeout) ->
  restrict: 'E'
  scope:
    format: '@'
  link: ($scope, element, attrs) ->

    updateTime = ->
      now = Date.now()
      element.html dateFilter(now, $scope.format)
      $timeout updateTime, now % 1000

    updateTime()