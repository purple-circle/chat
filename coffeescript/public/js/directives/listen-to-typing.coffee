app = angular.module('app')
app.directive "listenToTyping", ($timeout, api) ->
  templateUrl: "directives/chat/listen-to-typing.html"
  scope:
    roomId: "="
    chatId: "="
  link: ($scope) ->
    $scope.peopleTyping = {}
    $scope.peopleTypingTimeout = {}

    api
      .socket
      .on "typing", (data) ->
        if data.roomId isnt $scope.roomId or data.chatId isnt $scope.chatId
          return false

        myUsername = api.getUsername()
        if data.from is myUsername
          return false

        if !$scope.peopleTyping[data.chatId]
          $scope.peopleTyping[data.chatId] = {}

        if !$scope.peopleTyping[data.chatId][data.roomId]
          $scope.peopleTyping[data.chatId][data.roomId] = []

        if $scope.peopleTyping[data.chatId][data.roomId].indexOf(data.from) is -1
          $scope.peopleTyping[data.chatId][data.roomId].push data.from

        if $scope.peopleTypingTimeout[data.from]
          $timeout.cancel($scope.peopleTypingTimeout[data.from])

        $scope.peopleTypingTimeout[data.from] = $timeout ->
          index = $scope.peopleTyping[data.chatId][data.roomId].indexOf(data.from)
          if index > -1
            $scope.peopleTyping[data.chatId][data.roomId].splice(index, 1)
        , 3000
