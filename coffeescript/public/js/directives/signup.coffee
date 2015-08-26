app = angular.module('app')
app.directive 'signup', (api, accountData) ->
  templateUrl: 'directives/chat/signup.html'
  restrict: 'E'
  link: ($scope, element, attrs) ->
    $scope.username = api.getUsername()

    api
      .socket
      .on 'signup_error', (error) ->
        $scope.signup_in_progress = false
        $scope.errors = error

    $scope.signup = ->
      $scope.errors = {}
      if not $scope.username
        $scope.errors.username = true
        return

      if not $scope.password
        $scope.errors.password = true
        return

      data =
        username: $scope.username
        password: $scope.password
        email: $scope.email

      $scope.signup_in_progress = true

      api
        .signup(data)
        .then (result) ->
          $scope.signup_in_progress = false
          $scope.result = result
          accountData.account = result.account
        , (error) ->
          $scope.signup_in_progress = false
          $scope.errors = error
