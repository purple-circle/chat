app = angular.module('app')
app.directive 'dashboard', ->
  restrict: 'E'
  templateUrl: 'directives/dashboard/dashboard.html'
  link: ($scope, element, attrs) ->
