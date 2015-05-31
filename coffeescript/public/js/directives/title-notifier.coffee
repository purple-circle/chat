app = angular.module('app')
app.directive "titleNotifier", ($rootScope, tabActive, beep) ->
  link: ($scope) ->
    tabVisible = true

    unreadMessages = 0
    tabActive.check (status) ->
      tabVisible = status isnt "hidden"
      if tabVisible
        unreadMessages = 0
        $rootScope.page_title = "Chat"

    $rootScope.$on "tab-beep", ->
      if !tabVisible

        beep.create(4500)
        beep.create(400)
        beep.create(500)
        beep.create(1200)


    $rootScope.$on "message-notification", (event, room_id) ->
      if !tabVisible
        unreadMessages++
        $rootScope.page_title = "(#{unreadMessages}) Chat"
