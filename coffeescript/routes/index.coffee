'use strict'
express = require('express')
settings = require('../settings.js')

router = express.Router()

indexPage = (req, res) ->
  fs = require('fs')
  jsBuildStats = fs.statSync(path.join(__dirname, 'public/js/build.js'))
  jsBuildModified = new Date(jsBuildStats.mtime).getTime()

  cssBuildStats = fs.statSync(path.join(__dirname, 'public/css/chat.css'))
  cssBuildModified = new Date(cssBuildStats.mtime).getTime()

  res.render 'index', {
    sid: req.sessionID
    jsBuildModified
    cssBuildModified
    settings
  }

router.get '/', (req, res) ->
  indexPage req, res

router.get '/room/*', (req, res) ->
  indexPage req, res

router.get '/dashboard', (req, res) ->
  indexPage req, res

router.get '/dashboard/*', (req, res) ->
  indexPage req, res

router.get '/logout', (req, res) ->
  req.logout()
  res.redirect '/'

router.get '*', (req, res) ->
  res.redirect '/'

module.exports = router