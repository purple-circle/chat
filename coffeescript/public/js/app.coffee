'use strict'

app = angular.module('app', [
  'ui.router'
  'ui.router.compat'
  'templates'
  'ngMaterial'
  'youtube-embed'
  'vimeoEmbed'
  'ngSanitize'
  'batteryLevel'
  'luegg.directives' # scroll glue
  'angularMoment'
  'imgurUpload'
])

moment.locale 'en',
  calendar:
    lastDay: '[Yesterday at] LT'
    sameDay: 'LT'
    nextDay: '[Tomorrow at] LT'
    lastWeek: 'dddd [at] LT'
    nextWeek: 'dddd [at] LT'
    sameElse: 'L'


app.config ($stateProvider, $locationProvider) ->
  $locationProvider.html5Mode(true)
  $stateProvider
    .state 'root',
      url: '/'
      abstract: true
      template: '<ui-view/>'

    .state 'root.index',
      url: ''
      templateUrl: 'index.html'
      controller: 'index'

    .state 'root.index.room',
      url: 'room/:room_id'
      controller: 'index.room'

app.run ($rootScope) ->
  $rootScope.page_title = "Loading chat.."

  $rootScope.$on '$stateChangeStart', (event, toState) ->
    ga('send', 'pageview', toState.url)



secondsOnSite = 0
setInterval ->
  secondsOnSite++
, 1000

window.onbeforeunload = ->
  ga('send', 'event', 'timeSpentOnChat', 'seconds', secondsOnSite)



window.onerror = (msg, url, line, col, orig_error) ->
  if !JSON
    return false

  error = {msg, url, line, col, error: orig_error}

  ga('send', 'event', 'error', orig_error, JSON.stringify(error))
