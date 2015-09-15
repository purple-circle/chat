(function() {
  var Q, api, kue;

  Q = require('q');

  kue = require('kue');

  api = {};

  api.createQueue = function(name, data) {
    var deferred, job, jobs;
    deferred = Q.defer();
    jobs = kue.createQueue();
    job = jobs.create(name, data).save();
    job.on('complete', deferred.resolve).on('failed', deferred.reject);
    jobs.create('stats.save_api_log', name).save();
    return deferred.promise;
  };

  api.api_stats = function() {
    return api.createQueue('api.api_stats');
  };

  module.exports = api;

}).call(this);
