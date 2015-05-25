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


jobs.process "api.check_group_name", (job, done) ->
  Groups = mongoose.model 'groups'
  Groups
    .findOne({name: job.data})
    .select('name')
    .exec()
    .then (result) ->
      done(null, result)
    , done


jobs.process "api.createGroup", (job, done) ->
  Groups = mongoose.model 'groups'

  if job.data.description
    user_mentions = twitter.extractMentions(job.data.description)
    hashtags = twitter.extractHashtags(job.data.description)

    job.data.original_description = job.data.description

    job.data.description = twitter.autoLink(twitter.htmlEscape(job.data.description), twitter_text_options)

    if user_mentions || hashtags
      job.data.metadata = {}

    if user_mentions.length
      job.data.metadata.user_mentions = user_mentions

    if hashtags.length
      job.data.metadata.hashtags = hashtags

  group = new Groups(job.data)
  group.save (err) ->
    if err
      done(err)
    else
      done null, group

jobs.process "api.joinGroup", (job, done) ->
  GroupMembers = mongoose.model 'group_members'
  member = new GroupMembers(job.data)
  member.save (err) ->
    if err
      done(err)
    else
      done null, member


jobs.process "api.leaveGroup", (job, done) ->
  GroupMembers = mongoose.model 'group_members'

  GroupMembers
    .remove(job.data)
    .exec()
    .then (result) ->
      done(null, result)
    , done

jobs.process "api.checkMembership", (job, done) ->
  Members = mongoose.model 'group_members'
  Members
    .findOne(job.data)
    .exec()
    .then (result) ->
      membership = result isnt null
      done(null, membership)
    , done


jobs.process "api.editGroup", (job, done) ->
  Groups = mongoose.model 'groups'

  {id, data} = job.data

  if data.description
    user_mentions = twitter.extractMentions(data.description)
    hashtags = twitter.extractHashtags(data.description)

    data.original_description = data.description

    data.description = twitter.autoLink(twitter.htmlEscape(data.description), twitter_text_options)


    if user_mentions || hashtags
      data.metadata = {}

    if user_mentions.length
      data.metadata.user_mentions = user_mentions

    if hashtags.length
      data.metadata.hashtags = hashtags

  Groups
    .findByIdAndUpdate id, data, (err, group) ->
      if err
        handleError(err)
        done(err)
      else
        done null, group


jobs.process "api.getGroups", (job, done) ->
  filters = {}

  if job.data.category
    filters.category = job.data.category

  Groups = mongoose.model 'groups'
  Groups
    .find(filters)
    .exec()
    .then (result) ->
      done(null, result)
    , done


jobs.process "api.getGroup", (job, done) ->
  Groups = mongoose.model 'groups'
  Groups
    .findOne()
    .where('_id')
    .equals(job.data)
    .exec()
    .then (result) ->
      done(null, result)
    , done

jobs.process "api.load_chat_messages", (job, done) ->
  ChatMessages = mongoose.model 'chat_messages'
  ChatMessages
    .find()
    .where('chat_id')
    .equals(job.data)
    .limit(10)
    .sort("-created_at")
    .exec()
    .then (result) ->
      done(null, result)
    , done

jobs.process "api.save_chat_message", (job, done) ->
  user_mentions = twitter.extractMentions(job.data.message)
  hashtags = twitter.extractHashtags(job.data.message)

  job.data.original_message = job.data.message

  job.data.message = twitter.autoLink(twitter.htmlEscape(job.data.message), twitter_text_options)


  if user_mentions || hashtags
    job.data.metadata = {}

  if user_mentions.length
    job.data.metadata.user_mentions = user_mentions

  if hashtags.length
    job.data.metadata.hashtags = hashtags

  ChatMessages = mongoose.model 'chat_messages'
  message = new ChatMessages(job.data)
  message.save (err) ->
    if err
      done(err)
    else
      done null, message



