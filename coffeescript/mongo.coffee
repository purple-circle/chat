module.exports = (settings) ->
  mongoose = require('mongoose')

  chatMessageSchema = mongoose.Schema {
    chat_id: 'String'
    room_id: 'Number'
    message: 'String'
    sid: 'String'
    from: 'String'
    original_message: 'String'
    metadata: 'Object'
    created_at: { type: Date, default: Date.now }
  }

  topicSchema = mongoose.Schema {
    chat_id: 'String'
    room_id: 'Number'
    topic: 'String'
    from: 'String'
    created_at: { type: Date, default: Date.now }
  }

  roomSchema = mongoose.Schema {
    chat_id: 'String'
    name: 'String'
    created_by: 'String'
    sid: 'String'
    icon: 'String'
    created_at: { type: Date, default: Date.now }
  }

  imgurSchema = mongoose.Schema {
    id: 'String'
    title: 'String'
    description: 'String'
    datetime: 'Number'
    type: 'String'
    animated: 'String'
    width: 'String'
    height: 'Number'
    size: 'Number'
    views: 'Number'
    bandwidth: 'Number'
    vote: 'String'
    favorite: 'String'
    nsfw: 'String'
    section: 'String'
    account_url: 'String'
    account_id: 'Number'
    comment_preview: 'String'
    deletehash: 'String'
    name: 'String'
    link: 'String'
    chat_id: 'String'
    room_id: 'Number'
    sid: 'String'
    created_at: { type: Date, default: Date.now }
  }

  apiLogSchema = mongoose.Schema {
    name: 'String'
    created_at: { type: Date, default: Date.now }
  }

  mongoose.model 'chat_messages', chatMessageSchema
  mongoose.model 'topics', topicSchema
  mongoose.model 'rooms', roomSchema
  mongoose.model 'imgur', imgurSchema
  mongoose.model 'api_logs', apiLogSchema


  db = mongoose.connection

  db.on 'error', (error) ->
    console.log 'Mongodb returned error: %s', error

  db.on 'disconnected', ->
    console.log 'Mongodb connection disconnected'

  mongoose.connect 'localhost', settings.db
