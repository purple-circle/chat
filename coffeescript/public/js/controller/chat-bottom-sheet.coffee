app = angular.module('app')
app.controller 'GridBottomSheetCtrl', ($scope, $mdBottomSheet) ->
  $scope.items = [
    {
      name: 'Yolo'
      icon: 'twitter'
    }
  ]

  $scope.listItemClick = ($index) ->
    clickedItem = $scope.items[$index]
    $mdBottomSheet.hide clickedItem

    console.log "clickedItem", clickedItem

