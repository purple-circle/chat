app = angular.module('app')
app.filter 'newlines', ($sce) ->
  (text) ->
    $sce.trustAsHtml(text.replace(/(\n|&#10;)/g, '<br>'))
