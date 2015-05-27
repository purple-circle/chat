(function() {
  var jobs, kue, mongoose, selectUserFields, settings, twitter, twitter_text_options;

  require('newrelic');

  mongoose = require('mongoose');

  kue = require("kue");

  jobs = kue.createQueue();

  settings = require("../settings");

  require("../mongo")(settings);

  twitter = require('twitter-text');

  twitter_text_options = {
    usernameUrlBase: "/profile/",
    hashtagUrlBase: "/tag/",
    targetBlank: true
  };

  console.log("api worker running");

  selectUserFields = '-salt -hash';

  jobs.process("stats.save_api_log", function(job, done) {
    var Log, data, log;
    Log = mongoose.model('api_logs');
    data = {
      name: job.data
    };
    log = new Log(data);
    return log.save(function(err) {
      if (err) {
        return done(err);
      } else {
        return done(null, log);
      }
    });
  });

  jobs.process("api.api_stats", function(job, done) {
    var Log;
    Log = mongoose.model('api_logs');
    return Log.find().exec().then(function(result) {
      return done(null, result);
    }, done);
  });

  jobs.process("api.save_imgur", function(job, done) {
    var Imgur, imgur, imgurData;
    imgurData = job.data.data;
    imgurData.chat_id = job.data.chat_id;
    imgurData.room_id = job.data.room_id;
    imgurData.sid = job.data.sid;
    Imgur = mongoose.model('imgur');
    imgur = new Imgur(imgurData);
    return imgur.save(function(err) {
      if (err) {
        return done(err);
      } else {
        return done(null, imgur);
      }
    });
  });

  jobs.process("api.load_topic", function(job, done) {
    var ChatMessages;
    ChatMessages = mongoose.model('topics');
    return ChatMessages.findOne().where('chat_id').equals(job.data.chat_id).where('room_id').equals(job.data.room_id).limit(1).sort("-created_at").exec().then(function(result) {
      return done(null, result);
    }, done);
  });

  jobs.process("api.save_topic", function(job, done) {
    var Topics, topics;
    Topics = mongoose.model('topics');
    topics = new Topics(job.data);
    return topics.save(function(err) {
      if (err) {
        return done(err);
      } else {
        return done(null, topics);
      }
    });
  });

  jobs.process("api.load_chat_messages_for_room", function(job, done) {
    var ChatMessages;
    ChatMessages = mongoose.model('chat_messages');
    return ChatMessages.find().where('chat_id').equals(job.data.chat_id).where('room_id').equals(job.data.room_id).limit(10).sort("-created_at").exec().then(function(result) {
      return done(null, result);
    }, done);
  });

  jobs.process("api.save_chat_message", function(job, done) {
    var ChatMessages, hashtags, message, user_mentions;
    user_mentions = twitter.extractMentions(job.data.message);
    hashtags = twitter.extractHashtags(job.data.message);
    job.data.original_message = job.data.message;
    job.data.message = twitter.autoLink(twitter.htmlEscape(job.data.message), twitter_text_options);
    if (user_mentions || hashtags) {
      job.data.metadata = {};
    }
    if (user_mentions.length) {
      job.data.metadata.user_mentions = user_mentions;
    }
    if (hashtags.length) {
      job.data.metadata.hashtags = hashtags;
    }
    ChatMessages = mongoose.model('chat_messages');
    message = new ChatMessages(job.data);
    return message.save(function(err) {
      if (err) {
        return done(err);
      } else {
        return done(null, message);
      }
    });
  });

}).call(this);
