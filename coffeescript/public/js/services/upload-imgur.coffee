app = angular.module("app")
app.factory "uploadImgur", ($q) ->
  clientId = "3631cecbf2bf2cf"
  upload: (file, options = {}) ->
    deferred = $q.defer()

    if !clientId
      deferred.reject "No clientId"
      return deferred.promise

    if !file
      deferred.reject "No file"
      return deferred.promise

    if !options.canvas and !file?.type?.match(/image.*/)
        deferred.reject "File not image"
        return deferred.promise

    xhr = new XMLHttpRequest()
    xhr.open "POST", "https://api.imgur.com/3/image.json"
    xhr.setRequestHeader "Authorization", "Client-ID #{clientId}"

    xhr.upload.addEventListener 'progress', (event) ->
      percent = parseInt(event.loaded / event.total * 100)

      deferred.notify percent
    , false

    if !options.canvas
      fd = new FormData()
      fd.append "image", file

      xhr.send fd

    if options.canvas
      xhr.send file

    xhr.onerror = deferred.reject

    xhr.onload = ->
      result = JSON.parse(xhr.responseText)
      deferred.resolve result

    deferred.promise