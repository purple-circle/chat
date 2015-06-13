(function() {
  "use strict";
  var LocalStrategy, Users, express, indexPage, loginOptions, mongoose, passport, router;

  express = require("express");

  passport = require("passport");

  mongoose = require("mongoose");

  LocalStrategy = require("passport-local").Strategy;

  router = express.Router();

  Users = mongoose.model('users');

  passport.use(new LocalStrategy(Users.authenticate()));

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
      cssBuildModified: cssBuildModified
    });
  };

  router.get("/", function(req, res) {
    return indexPage(req, res);
  });

  router.get("/room/*", function(req, res) {
    return indexPage(req, res);
  });

  router.get("/logout", function(req, res) {
    req.logout();
    return res.redirect('/');
  });

  router.get("/login/success", function(req, res) {
    return res.jsonp({
      login: true
    });
  });

  router.get("/login/fail", function(req, res) {
    return res.jsonp({
      login: false
    });
  });

  loginOptions = {
    successRedirect: "/",
    failureRedirect: "/login/fail",
    failureFlash: false
  };

  router.post("/login", passport.authenticate("local", loginOptions), function(req, res) {
    return res.redirect("/");
  });

  router.get("*", function(req, res) {
    return res.redirect("/");
  });

  module.exports = router;

}).call(this);
