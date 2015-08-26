app = angular.module('app')
app.controller 'index.room', ($rootScope, $scope, $stateParams) ->
  $scope.roomId = $stateParams.room_id
