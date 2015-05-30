app = angular.module('app')

app.directive "chat", ($rootScope, $timeout, $mdSidenav, $mdDialog, api, tabActive) ->
  templateUrl: "directives/chat/chat.html"
  scope:
    chatId: "="
  link: ($scope) ->
    $scope.tabVisible = true
    $scope.currentRoom = false

    unreadMessages = 0
    tabActive.check (status) ->
      $timeout ->
        $scope.tabVisible = status is "hidden"
        if !$scope.tabVisible
          unreadMessages = 0
          $rootScope.page_title = "Chat"


    # TODO: refactor to service
    $rootScope.$on "currentRoom", (event, room) ->
      $scope.currentRoom = room
      $scope.roomId = room._id

    listenToMessageNotifications = ->
      $rootScope.$on "message-notification", (event, room_id) ->
        if $scope.tabVisible
          unreadMessages++
          $rootScope.page_title = "(#{unreadMessages}) Chat"


    $scope.toggleLeft = ->
      $mdSidenav('left').toggle()

    $scope.closeLeft = ->
      $mdSidenav('left').close()


    listenToMessageNotifications()
