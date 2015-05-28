(function() {
  "use strict";
  var express, router;

  express = require("express");

  router = express.Router();

  router.get("/", function(req, res) {
    var cssBuildModified, cssBuildStats, fs, jsBuildModified, jsBuildStats;
    fs = require("fs");
    jsBuildStats = fs.statSync("public/js/build.js");
    jsBuildModified = new Date(jsBuildStats.mtime).getTime();
    cssBuildStats = fs.statSync("public/css/chat.css");
    cssBuildModified = new Date(cssBuildStats.mtime).getTime();
    return res.render("index", {
      sid: req.sessionID,
      jsBuildModified: jsBuildModified,
      cssBuildModified: cssBuildModified
    });
  });

  router.get("*", function(req, res) {
    return res.redirect("/");
  });

  module.exports = router;

}).call(this);
