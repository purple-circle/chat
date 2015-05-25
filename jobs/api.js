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

  jobs.process("api.check_group_name", function(job, done) {
    var Groups;
    Groups = mongoose.model('groups');
    return Groups.findOne({
      name: job.data
    }).select('name').exec().then(function(result) {
      return done(null, result);
    }, done);
  });

  jobs.process("api.createGroup", function(job, done) {
    var Groups, group, hashtags, user_mentions;
    Groups = mongoose.model('groups');
    if (job.data.description) {
      user_mentions = twitter.extractMentions(job.data.description);
      hashtags = twitter.extractHashtags(job.data.description);
      job.data.original_description = job.data.description;
      job.data.description = twitter.autoLink(twitter.htmlEscape(job.data.description), twitter_text_options);
      if (user_mentions || hashtags) {
        job.data.metadata = {};
      }
      if (user_mentions.length) {
        job.data.metadata.user_mentions = user_mentions;
      }
      if (hashtags.length) {
        job.data.metadata.hashtags = hashtags;
      }
    }
    group = new Groups(job.data);
    return group.save(function(err) {
      if (err) {
        return done(err);
      } else {
        return done(null, group);
      }
    });
  });

  jobs.process("api.joinGroup", function(job, done) {
    var GroupMembers, member;
    GroupMembers = mongoose.model('group_members');
    member = new GroupMembers(job.data);
    return member.save(function(err) {
      if (err) {
        return done(err);
      } else {
        return done(null, member);
      }
    });
  });

  jobs.process("api.leaveGroup", function(job, done) {
    var GroupMembers;
    GroupMembers = mongoose.model('group_members');
    return GroupMembers.remove(job.data).exec().then(function(result) {
      return done(null, result);
    }, done);
  });

  jobs.process("api.checkMembership", function(job, done) {
    var Members;
    Members = mongoose.model('group_members');
    return Members.findOne(job.data).exec().then(function(result) {
      var membership;
      membership = result !== null;
      return done(null, membership);
    }, done);
  });

  jobs.process("api.editGroup", function(job, done) {
    var Groups, data, hashtags, id, ref, user_mentions;
    Groups = mongoose.model('groups');
    ref = job.data, id = ref.id, data = ref.data;
    if (data.description) {
      user_mentions = twitter.extractMentions(data.description);
      hashtags = twitter.extractHashtags(data.description);
      data.original_description = data.description;
      data.description = twitter.autoLink(twitter.htmlEscape(data.description), twitter_text_options);
      if (user_mentions || hashtags) {
        data.metadata = {};
      }
      if (user_mentions.length) {
        data.metadata.user_mentions = user_mentions;
      }
      if (hashtags.length) {
        data.metadata.hashtags = hashtags;
      }
    }
    return Groups.findByIdAndUpdate(id, data, function(err, group) {
      if (err) {
        handleError(err);
        return done(err);
      } else {
        return done(null, group);
      }
    });
  });

  jobs.process("api.getGroups", function(job, done) {
    var Groups, filters;
    filters = {};
    if (job.data.category) {
      filters.category = job.data.category;
    }
    Groups = mongoose.model('groups');
    return Groups.find(filters).exec().then(function(result) {
      return done(null, result);
    }, done);
  });

  jobs.process("api.getGroup", function(job, done) {
    var Groups;
    Groups = mongoose.model('groups');
    return Groups.findOne().where('_id').equals(job.data).exec().then(function(result) {
      return done(null, result);
    }, done);
  });

  jobs.process("api.load_chat_messages", function(job, done) {
    var ChatMessages;
    ChatMessages = mongoose.model('chat_messages');
    return ChatMessages.find().where('chat_id').equals(job.data).limit(10).sort("-created_at").exec().then(function(result) {
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
