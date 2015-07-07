app = angular.module('app')
app.factory 'asyncJsLoad', ->

  cache = {}
  addFile = (url) ->
    if cache[url]
      return true

    script = document.createElement('script')
    script.src = url
    script.type = 'text/javascript'
    script.async = true
    document.getElementsByTagName('head')[0].appendChild script

    cache[url] = true

  addYoutube = ->
    addFile('https://www.youtube.com/iframe_api')

  {
    addFile
    addYoutube
  }