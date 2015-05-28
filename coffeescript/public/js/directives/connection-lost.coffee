app = angular.module('app')
app.directive 'connectionLost', ($timeout, $interval, api) ->
  restrict: 'E'
  link: ($scope, element, attrs) ->
    interval = null
    timeout = null

    checkIntervalsAndTimeouts = ->
      if interval
        $interval.cancel(interval)

      if timeout
        $timeout.cancel(timeout)

    api
      .socket
      .on 'disconnect', ->
        ga('send', 'event', 'connection', 'disconnect')
        content = 'Connection lost, trying to reconnect..'
        api.notification.set(content, true)

        checkIntervalsAndTimeouts()

        timeout = $timeout ->
          seconds = 0
          interval = $interval ->
            seconds++
            newMessage = "#{content} #{seconds} sec.."
            api.notification.update(newMessage)
          , 1000
        , 4000

        api.socket.once 'connect', ->
          checkIntervalsAndTimeouts()

          api.notification
            .hide()
            .then ->
              api.notification.set('Reconnected! Happy chatting :)')

              ga('send', 'event', 'connection', 'reconnect')
