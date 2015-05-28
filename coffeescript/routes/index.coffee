"use strict"
express = require("express")

router = express.Router()

router.get "/", (req, res) ->
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


router.get "*", (req, res) ->
  res.redirect "/"

module.exports = router