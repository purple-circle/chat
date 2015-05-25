app = angular.module('app')

app.directive "chat", ($rootScope, $timeout, $mdSidenav, $mdBottomSheet, $mdMedia, api, animals) ->
  templateUrl: "directives/chat/chat.html"
  link: ($scope) ->
    $scope.chat_id = "chat-123"
    $scope.room_id = 1
    $scope.groups = []
    $scope.users = []
    $scope.message = ''

    $scope.currentUser = false
    $scope.currentGroup = false

    $scope.setActiveGroup = (group) ->
      if !group.$messagesFetched
        $timeout ->
          group.$messagesFetched = true
          $rootScope.$broadcast("getMessages", group.room_id)

      group.messages = 0
      $scope.currentGroup = group
      for g in $scope.groups when g.$selected is true
        g.$selected = false

      group.$selected = true
      $scope.room_id = group.room_id
      ga('send', 'event', 'groups', 'setActiveGroup', group.name, group.room_id)



    listenToMessageNotifications = ->
      $rootScope.$on "message-notification", (event, room_id) ->

        for g in $scope.groups when g.$selected isnt true
          if g.room_id is room_id
            g.messages++


    listenToMessageNotifications()


    $scope.from = "#{animals.getRandom()}-#{Math.ceil(Math.random()*100)}"
    ga('send', 'event', 'usernames', 'randomName', $scope.from)

    getGroups = ->
      $scope.groups = [
        {
          room_id: 1
          name: "Room #1"
          messages: 0
          icon: 'http://i.imgur.com/h18WTm2b.jpg'
        },{
          room_id: 2
          name: "Room #2"
          messages: 0
          icon: 'http://i.imgur.com/p8SNOcVb.jpg'
        },{
          room_id: 3
          name: "Room #666"
          messages: 0
          icon: 'http://i.imgur.com/CfmbeXib.jpg'
        }
      ]
      $scope.setActiveGroup($scope.groups[0])

    createMessage = (data) ->
      if !data.message
        return

      data.room_id = $scope.room_id
      data.chat_id = $scope.chat_id


      possibleUrl = api.stringHasUrl(data.message)
      if possibleUrl?[0] and api.urlIsImage(possibleUrl[0])
        api.testImage possibleUrl[0], ->
          ga('send', 'event', 'sharedImage', $scope.chat_id, possibleUrl[0])

      api.save_chat_messages(data)


    getGroups()


    $scope.createGroup = ->
      if !$scope.groupName
        return

      data =
        name: $scope.groupName
        created_by: $scope.currentUser


    $scope.toggleTimeSpent = ->
      $scope.showTimeSpent = !$scope.showTimeSpent

    $scope.saveMessage = ->
      if !$scope.message
        ga('send', 'event', 'messages', 'empty saveMessage', $scope.room_id)
        return

      ga('send', 'event', 'messages', 'saveMessage', $scope.room_id)

      data =
        chat_id: $scope.chat_id
        room_id: $scope.room_id
        message: $scope.message
        from: $scope.from
        sid: yolosid

      $scope.message = ''
      createMessage(data)

    $scope.toggleLeft = ->
      $mdSidenav('left').toggle()

    $scope.closeLeft = ->
      $mdSidenav('left').close()

