'use strict'

app = angular.module('app', [
  'ui.router'
  'ui.router.compat'
  'templates'
  'ngMaterial'
  'youtube-embed'
  'ngSanitize'
  'batteryLevel'
  'luegg.directives' # scroll glue
])

app.config ($stateProvider, $locationProvider) ->
  $locationProvider.html5Mode(true)
  $stateProvider
    .state 'index',
      url: '/'
      templateUrl: 'index.html'
      controller: 'index'

app.run ($rootScope) ->
  $rootScope.page_title = "(><)"

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
