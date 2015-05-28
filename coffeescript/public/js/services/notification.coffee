app = angular.module('app')
app.factory 'notification', ($mdToast) ->

  hide: ->
    $mdToast.hide()

  update: (message) ->
    $mdToast.updateContent(message)

  set: (message, hideDelay) ->
    toast = $mdToast
      .simple()
      .content(message)
      .position('right')

    if hideDelay
      toast.hideDelay(0)

    $mdToast.show(toast)
