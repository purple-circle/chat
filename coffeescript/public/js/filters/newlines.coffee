app = angular.module('app')
app.filter "newlines", ->
  (text) ->
    text.replace /\n/g, "<br>"
