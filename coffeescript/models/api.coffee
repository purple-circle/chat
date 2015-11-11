Q = require('q')
kue = require('kue')
api = {}

kueOptions =
  if process.env.REDIS_PORT
    {
      redis: {
        port: process.env.REDIS_PORT
      }
    }
  else
    {}

api.createQueue = (name, data) ->
  deferred = Q.defer()
  jobs = kue.createQueue(kueOptions)
  job = jobs
    .create(name, data)
    .save()
  job
    .on('complete', deferred.resolve)
    .on('failed', deferred.reject)

  jobs
    .create('stats.save_api_log', name)
    .save()

  deferred.promise

api.api_stats = ->
  api.createQueue('api.api_stats')


module.exports = api