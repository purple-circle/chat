(function() {
  "use strict";
  var express, router;

  express = require("express");

  router = express.Router();

  router.get("/", function(req, res) {
    var buildModified, buildStats, fs;
    fs = require("fs");
    buildStats = fs.statSync("public/js/build.js");
    buildModified = new Date(buildStats.mtime).getTime();
    return res.render("index", {
      sid: req.sessionID,
      buildModified: buildModified
    });
  });

  router.get("*", function(req, res) {
    return res.redirect("/");
  });

  module.exports = router;

}).call(this);
