app = angular.module('app')
app.factory 'testImage', ->
  urlIsImage: (url) ->
    url.match(/\.(jpeg|jpg|gif|png)$/) isnt null

  test: (url, callback) ->
    timeout = 5000
    timedOut = false
    timer = null
    img = new Image

    img.onerror = img.onabort = ->
      if !timedOut
        clearTimeout timer

    img.onload = ->
      if !timedOut
        clearTimeout timer
        callback url


    img.src = url
    timer = setTimeout ->
      timedOut = true
    , timeout

