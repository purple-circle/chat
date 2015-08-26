app = angular.module('app')
app.controller 'index', ($rootScope, $scope) ->
  $rootScope.page_title = 'Chat'
  $scope.chatId = 'chat-123'
