app = angular.module('app')
app.directive 'signup', (api) ->
  templateUrl: "directives/chat/signup.html"
  restrict: 'E'
  link: ($scope, element, attrs) ->
    $scope.username = api.getUsername()

    $scope.signup = ->
      console.log("Signup should happen here")