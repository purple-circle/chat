app = angular.module('app')
app.directive 'stats', ($timeout, api) ->
  restrict: 'E'
  templateUrl: 'directives/dashboard/stats.html'
  link: ($scope, element, attrs) ->
    if !Array::reduce?
      return

    api
      .api_stats()
      .then (stats) ->
        $scope.stats = stats.reduce (memo, stat) ->
          day = moment(stat.created_at).format("YYYYMMDD")
          memo[day] ?= {}
          memo[day][stat.name] ?= {date: stat.created_at, count: 0, name: stat.name}
          memo[day][stat.name].count++
          memo
        , {}
