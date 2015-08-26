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
          day = moment(stat.created_at).format('YYYYMMDD')
          memo[day] ?= {}
          memo[day][stat.name] ?= {date: stat.created_at, count: 0, name: stat.name}
          memo[day][stat.name].count++
          memo
        , {}

        cols = []

        for day of $scope.stats
          stat = $scope.stats[day]
          for row of stat
            name = stat[row].name
            if cols.indexOf(name) is -1
              cols.push name

        columnLength = cols.length - 1

        cols = cols.map (col, i) ->
          col =
            if i is 0
              label: 'Date'
              type: 'string'
            else
              label: col
              type: 'number'
          col

        dataRows = []
        for day of $scope.stats
          stat = $scope.stats[day]

          rows = [0..columnLength].map (row) -> v: 0
          rows[0] = v: day
          i = 0
          for row of stat
            i++
            rows[i] = v: stat[row].count

          dataRows.push c: rows


        $scope.chartObject =
          'type': 'AreaChart'
          'displayed': true
          'options':
            'title': 'Api stats'
            'fill': 20
            'vAxis':
              'title': 'Api calls'
              'gridlines': 'count': 10
            'hAxis': 'title': 'Date'
          'data':
            'cols': cols
            'rows': dataRows
