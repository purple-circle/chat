app = angular.module('app')
app.factory 'chatRooms', ->
  get: ->
    [
      {
        room_id: 1
        name: "Room #1"
        messages: 0
        icon: 'http://i.imgur.com/h18WTm2b.jpg'
      },{
        room_id: 2
        name: "Room #2"
        messages: 0
        icon: 'http://i.imgur.com/p8SNOcVb.jpg'
      },{
        room_id: 3
        name: "Room #666"
        messages: 0
        icon: 'http://i.imgur.com/CfmbeXib.jpg'
      },{
        room_id: 4
        name: "Politics"
        messages: 0
        icon: 'http://i.imgur.com/JxtD1vcb.jpg'
      },{
        room_id: 5
        name: "Pictures of cats"
        messages: 0
        icon: 'http://i.imgur.com/RaKwQD7b.jpg'
      },{
        room_id: 6
        name: "Best of Youtube"
        messages: 0
        icon: 'http://i.imgur.com/aaVkYvxb.png'
      },{
        room_id: 7
        name: "Usersub"
        messages: 0
        icon: 'http://i.imgur.com/YQwZUiJb.gif'
      }
    ]