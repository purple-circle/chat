app = angular.module('app')
app.directive 'keydown', ->
  restrict: 'A'
  scope:
    callback: '&keydown'
  link: ($scope, element, attrs) ->
    element.bind 'keydown', (event) ->
      if not event?.keyIdentifier
        return

      $scope.callback(key: event.keyIdentifier)
