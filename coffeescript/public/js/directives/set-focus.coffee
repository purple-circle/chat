app = angular.module('app')
app.directive 'setFocus', ->
  restrict: 'A'
  scope:
    focus: '=setFocus'
  link: ($scope, elem, attr) ->
    $scope.$watch 'focus', ->
      if $scope.focus
        elem[0].focus()