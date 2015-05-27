(function() {
  module.exports = function(settings) {
    var apiLogSchema, chatMessageSchema, db, imgurSchema, mongoose, topicSchema;
    mongoose = require('mongoose');
    chatMessageSchema = mongoose.Schema({
      chat_id: 'String',
      room_id: 'Number',
      message: 'String',
      sid: 'String',
      from: 'String',
      original_message: 'String',
      metadata: 'Object',
      created_at: {
        type: Date,
        "default": Date.now
      }
    });
    topicSchema = mongoose.Schema({
      chat_id: 'String',
      room_id: 'Number',
      topic: 'String',
      from: 'String',
      created_at: {
        type: Date,
        "default": Date.now
      }
    });
    imgurSchema = mongoose.Schema({
      id: 'String',
      title: 'String',
      description: 'String',
      datetime: 'Number',
      type: 'String',
      animated: 'String',
      width: 'String',
      height: 'Number',
      size: 'Number',
      views: 'Number',
      bandwidth: 'Number',
      vote: 'String',
      favorite: 'String',
      nsfw: 'String',
      section: 'String',
      account_url: 'String',
      account_id: 'Number',
      comment_preview: 'String',
      deletehash: 'String',
      name: 'String',
      link: 'String',
      chat_id: 'String',
      room_id: 'Number',
      sid: 'String',
      created_at: {
        type: Date,
        "default": Date.now
      }
    });
    apiLogSchema = mongoose.Schema({
      name: 'String',
      created_at: {
        type: Date,
        "default": Date.now
      }
    });
    mongoose.model('chat_messages', chatMessageSchema);
    mongoose.model('topics', topicSchema);
    mongoose.model('imgur', imgurSchema);
    mongoose.model('api_logs', apiLogSchema);
    db = mongoose.connection;
    db.on('error', function(error) {
      return console.log('Mongodb returned error: %s', error);
    });
    db.on('disconnected', function() {
      return console.log('Mongodb connection disconnected');
    });
    return mongoose.connect('localhost', settings.db);
  };

}).call(this);
