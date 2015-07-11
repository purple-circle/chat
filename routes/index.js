(function() {
  "use strict";
  var express, indexPage, router, settings;

  express = require("express");

  settings = require("../settings.js");

  router = express.Router();

  indexPage = function(req, res) {
    var cssBuildModified, cssBuildStats, fs, jsBuildModified, jsBuildStats;
    fs = require("fs");
    jsBuildStats = fs.statSync("public/js/build.js");
    jsBuildModified = new Date(jsBuildStats.mtime).getTime();
    cssBuildStats = fs.statSync("public/css/chat.css");
    cssBuildModified = new Date(cssBuildStats.mtime).getTime();
    return res.render("index", {
      sid: req.sessionID,
      jsBuildModified: jsBuildModified,
      cssBuildModified: cssBuildModified,
      settings: settings
    });
  };

  router.get("/", function(req, res) {
    return indexPage(req, res);
  });

  router.get("/room/*", function(req, res) {
    return indexPage(req, res);
  });

  router.get("/dashboard", function(req, res) {
    return indexPage(req, res);
  });

  router.get("/dashboard/*", function(req, res) {
    return indexPage(req, res);
  });

  router.get("/logout", function(req, res) {
    req.logout();
    return res.redirect("/");
  });

  router.get("*", function(req, res) {
    return res.redirect("/");
  });

  module.exports = router;

}).call(this);
