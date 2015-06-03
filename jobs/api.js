(function() {
  var jobs, kue, mongoose, selectUserFields, settings, twitter, twitter_text_options, unique;

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
    var Topics;
    Topics = mongoose.model('topics');
    return Topics.findOne().where('chat_id').equals(job.data.chat_id).where('room_id').equals(job.data.room_id).limit(1).sort("-created_at").exec().then(function(result) {
      return done(null, result);
    }, done);
  });

  jobs.process("api.save_topic", function(job, done) {
    var Topics, topic;
    Topics = mongoose.model('topics');
    topic = new Topics(job.data);
    return topic.save(function(err) {
      if (err) {
        return done(err);
      } else {
        return done(null, topic);
      }
    });
  });

  jobs.process("api.load_chat_messages_for_room", function(job, done) {
    var ChatMessages, limit, page;
    limit = 10;
    page = job.data.page || 0;
    ChatMessages = mongoose.model('chat_messages');
    return ChatMessages.find().where('chat_id').equals(job.data.chat_id).where('room_id').equals(job.data.room_id).limit(limit).skip(page * limit).sort("-created_at").exec().then(function(result) {
      return done(null, result);
    }, done);
  });

  unique = function(list) {
    var i, key, output, ref, results, value;
    output = {};
    for (key = i = 0, ref = list.length; 0 <= ref ? i < ref : i > ref; key = 0 <= ref ? ++i : --i) {
      output[list[key]] = list[key];
    }
    results = [];
    for (key in output) {
      value = output[key];
      results.push(value);
    }
    return results;
  };

  jobs.process("api.save_chat_message", function(job, done) {
    var ChatMessages, hashtags, message, urls, user_mentions;
    user_mentions = twitter.extractMentions(job.data.message);
    hashtags = twitter.extractHashtags(job.data.message);
    urls = twitter.extractUrls(job.data.message);
    job.data.original_message = job.data.message;
    job.data.message = twitter.autoLink(twitter.htmlEscape(job.data.message), twitter_text_options);
    if (user_mentions || hashtags || urls) {
      job.data.metadata = {};
    }
    if (user_mentions.length) {
      job.data.metadata.user_mentions = user_mentions;
    }
    if (hashtags.length) {
      job.data.metadata.hashtags = hashtags;
    }
    if (urls.length) {
      job.data.metadata.urls = unique(urls);
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

  jobs.process("api.create_room", function(job, done) {
    var Rooms, room;
    Rooms = mongoose.model('rooms');
    room = new Rooms(job.data);
    return room.save(function(err) {
      if (err) {
        return done(err);
      } else {
        return done(null, room);
      }
    });
  });

  jobs.process("api.get_rooms", function(job, done) {
    var Rooms;
    Rooms = mongoose.model('rooms');
    return Rooms.find().where('chat_id').equals(job.data.chat_id).exec().then(function(result) {
      return done(null, result);
    }, done);
  });

}).call(this);
