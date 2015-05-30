app = angular.module('app')
app.directive "titleNotifier", ($rootScope, tabActive) ->
  link: ($scope) ->
    tabVisible = true

    unreadMessages = 0
    tabActive.check (status) ->
      tabVisible = status is "hidden"
      if !tabVisible
        unreadMessages = 0
        $rootScope.page_title = "Chat"

    $rootScope.$on "message-notification", (event, room_id) ->
      if tabVisible
        unreadMessages++
        $rootScope.page_title = "(#{unreadMessages}) Chat"
