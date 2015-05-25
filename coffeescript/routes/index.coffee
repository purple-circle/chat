"use strict"
express = require("express")

router = express.Router()

router.get "/", (req, res) ->
  res.render "index",
    sid: req.sessionID


router.get "*", (req, res) ->
  res.redirect "/"

module.exports = router