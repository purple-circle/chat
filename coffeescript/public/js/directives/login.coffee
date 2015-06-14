app = angular.module('app')
app.directive 'login', (api) ->
  templateUrl: 'directives/chat/login.html'
  restrict: 'E'
  link: ($scope, element, attrs) ->
    $scope.username = api.getUsername()

    api
      .socket
      .on "login_error", (error) ->
        console.log "error", error
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
        .then (account) ->
          console.log "login success", account
          $scope.login_in_progress = false
          $scope.account = account
        , (error) ->
          console.log "login error", error
          $scope.errors = error
          $scope.login_in_progress = false
