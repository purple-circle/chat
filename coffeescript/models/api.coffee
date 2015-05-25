Q = require("q")
kue = require("kue")
api = {}

api.createQueue = (name, data) ->
  deferred = Q.defer()
  jobs = kue.createQueue()
  job = jobs
    .create(name, data)
    .save()
  job
    .on("complete", deferred.resolve)
    .on("failed", deferred.reject)

  jobs
    .create('stats.save_api_log', name)
    .save()

  deferred.promise

api.api_stats = ->
  api.createQueue("api.api_stats")


module.exports = api