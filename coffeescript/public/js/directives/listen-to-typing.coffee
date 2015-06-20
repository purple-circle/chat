app = angular.module('app')
app.directive "listenToTyping", ($timeout, api) ->
  templateUrl: "directives/chat/listen-to-typing.html"
  scope:
    roomId: "="
    chatId: "="
  link: ($scope) ->
    $scope.peopleTyping = []
    $scope.peopleTypingTimeout = {}

    api
      .socket
      .on "typing", (data) ->
        myUsername = api.getUsername()
        if data.from is myUsername
          return false

        if $scope.peopleTyping.indexOf(data.from) is -1
          $scope.peopleTyping.push data.from

        if $scope.peopleTypingTimeout[data.from]
          $timeout.cancel($scope.peopleTypingTimeout[data.from])

        $scope.peopleTypingTimeout[data.from] = $timeout ->
          index = $scope.peopleTyping.indexOf(data.from)
          if index > -1
            $scope.peopleTyping.splice(index, 1)
        , 3000
