(function() {
  var Q, getOpenGraphData, getUrlContent, getUrlDataRetry, jobs, kue, mongoose, objectLength, request, selectUserFields, settings, twitter, twitter_text_options, unique;

  require('newrelic');

  mongoose = require('mongoose');

  kue = require("kue");

  jobs = kue.createQueue();

  settings = require("../settings");

  require("../mongo")(settings);

  twitter = require('twitter-text');

  request = require("request");

  Q = require("q");

  twitter_text_options = {
    usernameUrlBase: "/profile/",
    hashtagUrlBase: "/tag/",
    targetBlank: true
  };

  console.log("api worker running");

  selectUserFields = '-salt -hash';

  getOpenGraphData = function(url) {
    var Tags;
    Tags = mongoose.model('open_graph_tags');
    return Tags.findOne().where('url').equals(url).sort("-created_at").exec();
  };

  getUrlDataRetry = function(url, done, retry_count) {
    var retry_limit, retry_seconds;
    retry_seconds = 3;
    retry_limit = 5;
    return getOpenGraphData(url).then(function(result) {
      var error;
      if (result == null) {
        console.log("No results yet, retrying " + retry_seconds + " seconds", url);
        retry_count++;
        if (retry_count >= retry_limit) {
          error = "Data not found after " + retry_limit + " retries";
          console.log(error);
          done({
            error: error
          });
          return;
        }
        return setTimeout(function() {
          return getUrlDataRetry(url, done, retry_count);
        }, retry_seconds * 1000);
      } else {
        return done(null, result);
      }
    }, done);
  };

  getUrlContent = function(url) {
    var deferred;
    deferred = Q.defer();
    request(url, function(error, response, data) {
      if (!error && response.statusCode === 200) {
        return deferred.resolve(data);
      } else {
        return deferred.reject({
          error: error
        });
      }
    });
    return deferred.promise;
  };

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

  objectLength = function(obj) {
    return Object.keys(obj).length;
  };

  jobs.process("api.store_twitter_tags", function(job, done) {
    var Tags, data, tag, tags, twitterTags;
    twitterTags = require('twitter-tag-scraper');
    tags = twitterTags.parseHtml(job.data.content);
    if (!objectLength(tags)) {
      done({
        error: "No tags"
      });
      return;
    }
    data = {
      url: job.data.url,
      tags: tags
    };
    Tags = mongoose.model('twitter_tags');
    tag = new Tags(data);
    return tag.save(function(err) {
      if (err) {
        return done(err);
      } else {
        return done(null, tag);
      }
    });
  });

  jobs.process("api.store_open_graph_tags", function(job, done) {
    var Tags, data, ogTags, tag, tags;
    ogTags = require('open-graph-tag-scraper');
    tags = ogTags.parseHtml(job.data.content);
    if (!objectLength(tags)) {
      done({
        error: "No tags"
      });
      return;
    }
    data = {
      url: job.data.url,
      tags: tags
    };
    Tags = mongoose.model('open_graph_tags');
    tag = new Tags(data);
    return tag.save(function(err) {
      if (err) {
        return done(err);
      } else {
        return done(null, tag);
      }
    });
  });

  jobs.process("api.process_urls_from_message", function(job, done) {
    var i, len, ref, results, url, urls;
    urls = (ref = job.data.metadata) != null ? ref.urls : void 0;
    if (!urls.length) {
      done({
        error: "No urls"
      });
      return;
    }
    results = [];
    for (i = 0, len = urls.length; i < len; i++) {
      url = urls[i];
      results.push(getUrlContent(url).then(function(content) {
        var data;
        data = {
          content: content,
          url: url,
          message: job.data
        };
        jobs.create('api.store_twitter_tags', data).save();
        jobs.create('api.store_open_graph_tags', data).save();
        return done(null, url);
      }));
    }
    return results;
  });

  jobs.process("api.getOpenGraphData", function(job, done) {
    return getOpenGraphData(job.data).then(function(result) {
      return done(null, result);
    }, done);
  });

  jobs.process("api.getUrlDataRetry", function(job, done) {
    return getUrlDataRetry(job.data, done, 0);
  });

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
        done(null, message);
        if (urls.length) {
          return jobs.create('api.process_urls_from_message', message).save();
        }
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
