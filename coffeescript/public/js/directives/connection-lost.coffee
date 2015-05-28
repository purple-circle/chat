app = angular.module('app')
app.directive 'connectionLost', ($timeout, $interval, $mdToast, api) ->
  restrict: 'E'
  link: ($scope, element, attrs) ->
    interval = null
    timeout = null

    api
      .socket
      .on 'disconnect', ->
        ga('send', 'event', 'connection', 'disconnect')
        content = 'Connection lost, trying to reconnect..'
        toast = $mdToast
          .simple()
          .content(content)
          .position('right')
          .hideDelay(0)

        $mdToast.show(toast)

        if interval
          $interval.cancel(interval)

        if timeout
          $timeout.cancel(timeout)

        timeout = $timeout ->
          seconds = 0
          interval = $interval ->
            seconds++
            newMessage = "#{content} #{seconds} sec.."
            $mdToast.updateContent(newMessage)
          , 1000
        , 4000

        api.socket.once 'connect', ->
          if interval
            $interval.cancel(interval)

          if timeout
            $timeout.cancel(timeout)

          $mdToast
            .hide()
            .then ->
              toast = $mdToast
                .simple()
                .content('Reconnected! Happy chatting :)')
                .position('right')

              $mdToast.show(toast)
              ga('send', 'event', 'connection', 'reconnect')

