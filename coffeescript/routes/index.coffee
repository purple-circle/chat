"use strict"
express = require("express")

router = express.Router()

router.get "/", (req, res) ->
  fs = require("fs")
  buildStats = fs.statSync("public/js/build.js")

  buildModified = new Date(buildStats.mtime).getTime()

  res.render "index",
    sid: req.sessionID
    buildModified: buildModified


router.get "*", (req, res) ->
  res.redirect "/"

module.exports = router