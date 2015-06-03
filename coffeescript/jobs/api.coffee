require('newrelic')
mongoose = require('mongoose')
kue = require("kue")
jobs = kue.createQueue()

settings = require("../settings")
require("../mongo")(settings)

twitter = require('twitter-text')

twitter_text_options =
  usernameUrlBase: "/profile/"
  hashtagUrlBase: "/tag/"
  targetBlank: true

console.log "api worker running"
selectUserFields = '-salt -hash'


jobs.process "stats.save_api_log", (job, done) ->
  Log = mongoose.model 'api_logs'

  data =
    name: job.data

  log = new Log(data)
  log.save (err) ->
    if err
      done(err)
    else
      done null, log

jobs.process "api.api_stats", (job, done) ->
  Log = mongoose.model 'api_logs'
  Log
    .find()
    .exec()
    .then (result) ->
      done(null, result)
    , done


jobs.process "api.save_imgur", (job, done) ->
  imgurData = job.data.data
  imgurData.chat_id = job.data.chat_id
  imgurData.room_id = job.data.room_id
  imgurData.sid = job.data.sid

  Imgur = mongoose.model 'imgur'
  imgur = new Imgur(imgurData)
  imgur.save (err) ->
    if err
      done(err)
    else
      done null, imgur


jobs.process "api.load_topic", (job, done) ->
  Topics = mongoose.model 'topics'
  Topics
    .findOne()
    .where('chat_id')
    .equals(job.data.chat_id)
    .where('room_id')
    .equals(job.data.room_id)
    .limit(1)
    .sort("-created_at")
    .exec()
    .then (result) ->
      done(null, result)
    , done

jobs.process "api.save_topic", (job, done) ->
  Topics = mongoose.model 'topics'
  topic = new Topics(job.data)
  topic.save (err) ->
    if err
      done(err)
    else
      done null, topic

jobs.process "api.load_chat_messages_for_room", (job, done) ->
  limit = 10
  page = job.data.page or 0

  ChatMessages = mongoose.model 'chat_messages'
  ChatMessages
    .find()
    .where('chat_id')
    .equals(job.data.chat_id)
    .where('room_id')
    .equals(job.data.room_id)
    .limit(limit)
    .skip(page * limit)
    .sort("-created_at")
    .exec()
    .then (result) ->
      done(null, result)
    , done

# TODO: this should be in some helpers utility or then just use lodash
unique = (list) ->
  output = {}
  output[list[key]] = list[key] for key in [0...list.length]
  value for key, value of output


jobs.process "api.save_chat_message", (job, done) ->
  user_mentions = twitter.extractMentions(job.data.message)
  hashtags = twitter.extractHashtags(job.data.message)
  urls = twitter.extractUrls(job.data.message)

  job.data.original_message = job.data.message

  job.data.message = twitter.autoLink(twitter.htmlEscape(job.data.message), twitter_text_options)


  if user_mentions || hashtags || urls
    job.data.metadata = {}

  if user_mentions.length
    job.data.metadata.user_mentions = user_mentions

  if hashtags.length
    job.data.metadata.hashtags = hashtags

  if urls.length
    job.data.metadata.urls = unique(urls)

  ChatMessages = mongoose.model 'chat_messages'
  message = new ChatMessages(job.data)
  message.save (err) ->
    if err
      done(err)
    else
      done null, message


jobs.process "api.create_room", (job, done) ->
  Rooms = mongoose.model 'rooms'
  room = new Rooms(job.data)
  room.save (err) ->
    if err
      done(err)
    else
      done null, room


jobs.process "api.get_rooms", (job, done) ->
  Rooms = mongoose.model 'rooms'
  Rooms
    .find()
    .where('chat_id')
    .equals(job.data.chat_id)
    .exec()
    .then (result) ->
      done(null, result)
    , done