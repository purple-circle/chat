app = angular.module('app')
app.directive 'stats', ($timeout, api) ->
  restrict: 'E'
  templateUrl: 'directives/dashboard/stats.html'
  link: ($scope, element, attrs) ->
    api
      .api_stats()
      .then (stats) ->
        console.log "stats", stats
        $timeout ->
          $scope.stats = stats
