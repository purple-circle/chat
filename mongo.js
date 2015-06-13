(function() {
  module.exports = function(settings) {
    var apiLogSchema, chatMessageSchema, db, facebookUserSchema, getRandomName, getRandomUserName, googleUserSchema, imgurSchema, instagramUserSchema, mongoose, openGraphTagSchema, passportLocalMongoose, roomSchema, topicSchema, twitterTagSchema, userSchema;
    mongoose = require('mongoose');
    passportLocalMongoose = require('passport-local-mongoose');
    getRandomName = function() {
      var num;
      num = Math.ceil(Math.random() * 1000);
      return "Anonymous Monkeyhandler " + num;
    };
    getRandomUserName = function() {
      var num;
      num = Math.ceil(Math.random() * 1000);
      return "anonymous.manbearpig." + num;
    };
    chatMessageSchema = mongoose.Schema({
      chat_id: 'String',
      room_id: 'ObjectId',
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
      room_id: 'ObjectId',
      topic: 'String',
      from: 'String',
      created_at: {
        type: Date,
        "default": Date.now
      }
    });
    roomSchema = mongoose.Schema({
      chat_id: 'String',
      name: 'String',
      created_by: 'String',
      sid: 'String',
      icon: 'String',
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
      room_id: 'ObjectId',
      sid: 'String',
      created_at: {
        type: Date,
        "default": Date.now
      }
    });
    twitterTagSchema = mongoose.Schema({
      url: 'String',
      tags: 'Object',
      created_at: {
        type: Date,
        "default": Date.now
      }
    });
    openGraphTagSchema = mongoose.Schema({
      url: 'String',
      tags: 'Object',
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
    userSchema = mongoose.Schema({
      name: {
        type: String,
        trim: true,
        "default": getRandomName
      },
      username: {
        type: String,
        lowercase: true,
        trim: true,
        "default": getRandomUserName
      },
      email: {
        type: String,
        lowercase: true,
        trim: true
      },
      password: 'String',
      gender: {
        type: String,
        lowercase: true,
        trim: true,
        "default": "doge"
      },
      bio: 'String',
      original_bio: 'String',
      birthday: 'Date',
      facebook_id: 'String',
      google_id: 'String',
      instagram_id: 'String',
      picture_url: 'String',
      cover_url: 'String',
      fanpage_id: 'ObjectId',
      metadata: 'Object',
      created: {
        type: Date,
        "default": Date.now
      },
      show_birthday: {
        type: Boolean,
        "default": true
      },
      show_bio: {
        type: Boolean,
        "default": true
      },
      show_gender: {
        type: Boolean,
        "default": true
      },
      hidden: {
        type: Boolean,
        "default": false
      },
      random: {
        type: [Number],
        index: '2d',
        "default": function() {
          return [Math.random(), Math.random()];
        }
      }
    });
    facebookUserSchema = mongoose.Schema({
      id: 'String',
      user_id: 'String',
      name: 'String',
      first_name: 'String',
      middle_name: 'String',
      last_name: 'String',
      username: {
        type: String,
        lowercase: true,
        trim: true
      },
      url: 'String',
      gender: 'String',
      email: 'String',
      emails: {
        type: Array
      },
      quotes: 'String',
      bio: 'String',
      birthday: 'Date',
      locale: 'String',
      timezone: 'String',
      verified: 'String',
      metadata: 'Object',
      accessToken: 'String',
      created: {
        type: Date,
        "default": Date.now
      }
    });
    googleUserSchema = mongoose.Schema({
      id: 'String',
      user_id: 'String',
      name: 'String',
      first_name: 'String',
      last_name: 'String',
      emails: {
        type: Array
      },
      metadata: 'Object',
      identifier: 'String',
      created: {
        type: Date,
        "default": Date.now
      }
    });
    instagramUserSchema = mongoose.Schema({
      id: 'String',
      user_id: 'String',
      name: 'String',
      first_name: 'String',
      last_name: 'String',
      bio: 'String',
      website: 'String',
      profile_picture: 'String',
      metadata: 'Object',
      accessToken: 'String',
      created: {
        type: Date,
        "default": Date.now
      }
    });
    userSchema.plugin(passportLocalMongoose);
    mongoose.model('chat_messages', chatMessageSchema);
    mongoose.model('topics', topicSchema);
    mongoose.model('rooms', roomSchema);
    mongoose.model('imgur', imgurSchema);
    mongoose.model('twitter_tags', twitterTagSchema);
    mongoose.model('open_graph_tags', openGraphTagSchema);
    mongoose.model('api_logs', apiLogSchema);
    mongoose.model('users', userSchema);
    mongoose.model('facebook_user_data', facebookUserSchema);
    mongoose.model('instagram_user_data', instagramUserSchema);
    mongoose.model('google_user_data', googleUserSchema);
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
