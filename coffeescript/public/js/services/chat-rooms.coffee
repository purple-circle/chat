app = angular.module('app')
app.factory 'chatRooms', (api) ->
  get: (chat_id) ->
    api.load_rooms({chat_id})
