require('newrelic')
mongoose = require('mongoose')
kue = require("kue")
jobs = kue.createQueue()

settings = require("../settings")
require("../mongo")(settings)

twitter = require('twitter-text')

request = require("request")
Q = require("q")


twitter_text_options =
  usernameUrlBase: "/profile/"
  hashtagUrlBase: "/tag/"
  targetBlank: true

console.log "api worker running"
selectUserFields = '-salt -hash'



getOpenGraphData = (url) ->
  Tags = mongoose.model 'open_graph_tags'
  Tags
    .findOne()
    .where('url')
    .equals(url)
    .sort("-created_at")
    .exec()


getUrlDataRetry = (url, done, retry_count) ->
  retry_seconds = 3
  retry_limit = 5

  getOpenGraphData(url)
    .then (result) ->
      if !result?
        console.log "No results yet, retrying #{retry_seconds} seconds", url
        retry_count++

        if retry_count >= retry_limit
          error = "Data not found after #{retry_limit} retries"
          console.log error
          done({error})
          return

        setTimeout ->
          getUrlDataRetry(url, done, retry_count)
        , retry_seconds * 1000

      else
        done(null, result)
    , done


getUrlContent = (url) ->
  deferred = Q.defer()

  request url, (error, response, data) ->
    if !error && response.statusCode is 200
      deferred.resolve data
    else
      deferred.reject {error}

  deferred.promise



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
    .limit(300)
    .sort("-created_at")
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

objectLength = (obj) ->
  Object.keys(obj).length

jobs.process "api.store_twitter_tags", (job, done) ->
  twitterTags = require('twitter-tag-scraper')
  tags = twitterTags.parseHtml(job.data.content)
  if !objectLength(tags)
    done({error: "No tags"})
    return

  data =
    url: job.data.url
    tags: tags

  Tags = mongoose.model 'twitter_tags'
  tag = new Tags(data)
  tag.save (err) ->
    if err
      done(err)
    else
      done null, tag


jobs.process "api.store_open_graph_tags", (job, done) ->
  ogTags = require('open-graph-tag-scraper')
  tags = ogTags.parseHtml(job.data.content)
  if !objectLength(tags)
    done({error: "No tags"})
    return

  data =
    url: job.data.url
    tags: tags

  Tags = mongoose.model 'open_graph_tags'
  tag = new Tags(data)
  tag.save (err) ->
    if err
      done(err)
    else
      done null, tag



jobs.process "api.process_urls_from_message", (job, done) ->
  urls = job.data.metadata?.urls

  if !urls.length
    done({error: "No urls"})
    return


  for url in urls
    getUrlContent(url)
      .then (content) ->
        data = {
          content
          url
          message: job.data
        }

        jobs
          .create('api.store_twitter_tags', data)
          .save()

        jobs
          .create('api.store_open_graph_tags', data)
          .save()

        done null, url


jobs.process "api.getOpenGraphData", (job, done) ->
  getOpenGraphData(job.data)
    .then (result) ->
      done null, result
    , done

jobs.process "api.getUrlDataRetry", (job, done) ->
  getUrlDataRetry(job.data, done, 0)


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

      if urls.length
        jobs
          .create('api.process_urls_from_message', message)
          .save()


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


jobs.process "api.check_username", (job, done) ->
  Users = mongoose.model 'users'
  Users
    .findOne({username: job.data})
    .select('username')
    .exec()
    .then (result) ->
      done(null, result)
    , done


jobs.process "api.localSignupUser", (job, done) ->
  User = mongoose.model 'users'
  User.register new User(username: job.data.username), job.data.password, (err, account) ->
    if err
      done err
    else
      done null, account



jobs.process "api.create_profile_picture_album", (job, done) ->
  ProfilePictureAlbum = mongoose.model 'profile_picture_albums'
  album = new ProfilePictureAlbum(job.data)
  album.save (err) ->
    if err
      done(err)
    else
      done null, album

jobs.process "api.get_profile_picture_albums", (job, done) ->
  Albums = mongoose.model 'profile_picture_albums'
  Albums
    .find({user_id: job.data})
    .exec()
    .then (result) ->
      done(null, result)
    , done


jobs.process "api.saveFacebookData", (job, done) ->
  Facebook = mongoose.model 'facebook_user_data'
  facebook = new Facebook(job.data)
  facebook.save (err) ->
    if err
      done(err)
    else
      done null, facebook


jobs.process "api.saveGoogleData", (job, done) ->
  Google = mongoose.model 'google_user_data'
  google = new Google(job.data)
  google.save (err) ->
    if err
      done(err)
    else
      done null, google

jobs.process "api.saveInstagramData", (job, done) ->
  Instagram = mongoose.model 'instagram_user_data'
  instagram = new Instagram(job.data)
  instagram.save (err) ->
    if err
      done(err)
    else
      done null, instagram

