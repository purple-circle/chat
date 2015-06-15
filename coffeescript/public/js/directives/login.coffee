app = angular.module('app')
app.directive 'login', (api, accountData) ->
  templateUrl: 'directives/chat/login.html'
  restrict: 'E'
  link: ($scope, element, attrs) ->
    $scope.username = api.getUsername()

    api
      .socket
      .on "login_error", (error) ->
        $scope.login_in_progress = false
        $scope.errors = error

    $scope.login = ->
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

      $scope.login_in_progress = true

      api
        .login(data)
        .then (result) ->
          $scope.login_in_progress = false
          accountData.account = result.account
        , (error) ->
          $scope.errors = error
          $scope.login_in_progress = false
