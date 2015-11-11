app = angular.module('app')
app.controller 'simpleDialog', ($scope, $mdDialog) ->
  $scope.close = $mdDialog.cancel