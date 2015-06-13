"use strict"
express = require("express")
passport = require("passport")
mongoose = require("mongoose")
LocalStrategy = require("passport-local").Strategy

router = express.Router()
Users = mongoose.model 'users'
passport.use new LocalStrategy(Users.authenticate())


indexPage = (req, res) ->
  fs = require("fs")
  jsBuildStats = fs.statSync("public/js/build.js")
  jsBuildModified = new Date(jsBuildStats.mtime).getTime()

  cssBuildStats = fs.statSync("public/css/chat.css")
  cssBuildModified = new Date(cssBuildStats.mtime).getTime()

  res.render "index", {
    sid: req.sessionID
    jsBuildModified
    cssBuildModified
  }

router.get "/", (req, res) ->
  indexPage req, res

router.get "/room/*", (req, res) ->
  indexPage req, res

router.get "/logout", (req, res) ->
  req.logout()
  res.redirect('/')

router.get "/login/success", (req, res) ->
  res.jsonp {login: true}

router.get "/login/fail", (req, res) ->
  res.jsonp {login: false}

loginOptions =
  successRedirect: "/"
  failureRedirect: "/login/fail"
  failureFlash: false

router.post "/login", passport.authenticate("local", loginOptions), (req, res) ->
  res.redirect "/"


router.get "*", (req, res) ->
  res.redirect "/"

module.exports = router