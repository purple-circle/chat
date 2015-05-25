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

  apiLogSchema = mongoose.Schema {
    name: 'String'
    created_at: { type: Date, default: Date.now }
  }

  mongoose.model 'chat_messages', chatMessageSchema
  mongoose.model 'topics', topicSchema
  mongoose.model 'api_logs', apiLogSchema


  db = mongoose.connection

  db.on 'error', (error) ->
    console.log 'Mongodb returned error: %s', error

  db.on 'disconnected', ->
    console.log 'Mongodb connection disconnected'

  mongoose.connect 'localhost', settings.db
