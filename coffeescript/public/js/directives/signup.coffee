app = angular.module('app')
app.directive 'signup', (api) ->
  templateUrl: "directives/chat/signup.html"
  restrict: 'E'
  link: ($scope, element, attrs) ->
    $scope.username = api.getUsername()

    api
      .socket
      .on "signup_error", (error) ->
        $scope.signup_in_progress = false
        $scope.errors = error

    $scope.signup = ->
      $scope.errors = {}
      if !$scope.username
        $scope.errors.username = true
        return

      if !$scope.password
        $scope.errors.password = true
        return

      data =
        username: $scope.username
        password: $scope.password
        email: $scope.email

      $scope.signup_in_progress = true

      api
        .signup(data)
        .then (account) ->
          $scope.signup_in_progress = false
          $scope.account = account
        , (error) ->
          $scope.signup_in_progress = false
          $scope.errors = error
