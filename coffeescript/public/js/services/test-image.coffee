app = angular.module('app')
app.service 'testImage', ($q) ->
  urlIsImage = (url) ->
    parser = document.createElement('a')
    parser.href = url
    parsedUrl = "#{parser.protocol}//#{parser.host}#{parser.pathname}"

    parsedUrl.match(/\.(jpeg|jpg|gif|png)$/) isnt null


  urlIsImage: urlIsImage

  test: (url) ->
    deferred = $q.defer()

    if not url
      deferred.reject('No url provided')
      return deferred.promise

    if not urlIsImage(url)
      deferred.reject('Provided url doesn\'t contain image')
      return deferred.promise

    timeout = 5000
    timedOut = false
    timer = null
    img = new Image()

    img.onerror = img.onabort = ->
      deferred.reject('Image error or aborted')
      if not timedOut
        clearTimeout timer

    img.onload = ->
      if not timedOut
        clearTimeout timer
        deferred.resolve(url)

    img.src = url

    timer = setTimeout ->
      timedOut = true
      deferred.reject('Timeout')
    , timeout

    deferred.promise
