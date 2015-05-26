app = angular.module("app")
app.factory "uploadImgur", ($q) ->
  clientId = "3631cecbf2bf2cf"
  upload: (file) ->
    deferred = $q.defer()
    if !file
      deferred.reject "No file"
      return deferred.promise

    if !file?.type?.match(/image.*/)
      deferred.reject "File not image"
      return deferred.promise

    fd = new FormData()
    fd.append "image", file

    xhr = new XMLHttpRequest()
    xhr.open "POST", "https://api.imgur.com/3/image.json"
    xhr.setRequestHeader "Authorization", "Client-ID #{clientId}"
    xhr.send fd

    xhr.onload = ->
      result = JSON.parse(xhr.responseText)
      deferred.resolve result

    deferred.promise