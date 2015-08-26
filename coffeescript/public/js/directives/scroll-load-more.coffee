app = angular.module('app')
app.directive 'scrollLoadMore', ($timeout) ->
  scope:
    callback: '&scrollLoadMore'
  link: ($scope, element, attr) ->
    timeout = null

    # TODO: implement lodash throttle
    element.bind 'scroll', ->
      if element[0].scrollTop < 50
        if timeout
          $timeout.cancel(timeout)

        timeout = $timeout ->
          $scope.callback()
        , 100
