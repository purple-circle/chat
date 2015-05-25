(function() {
  "use strict";
  var express, router;

  express = require("express");

  router = express.Router();

  router.get("/", function(req, res) {
    return res.render("index", {
      sid: req.sessionID
    });
  });

  router.get("*", function(req, res) {
    return res.redirect("/");
  });

  module.exports = router;

}).call(this);
