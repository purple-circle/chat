app = angular.module('app')
app.controller 'dashboard', ($rootScope, $scope) ->
  $rootScope.page_title = "Dashboard"
