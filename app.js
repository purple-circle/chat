(function() {
  var RedisStore, app, bodyParser, cookieParser, express, favicon, logger, longCookieIsLong, passport, path, routes, server, session, sessionStore, settings;

  require('newrelic');

  express = require("express");

  path = require("path");

  favicon = require("serve-favicon");

  logger = require("morgan");

  cookieParser = require("cookie-parser");

  bodyParser = require("body-parser");

  passport = require("passport");

  settings = require("./settings");

  require("./mongo")(settings);

  routes = require("./routes/index");

  session = require("express-session");

  RedisStore = require('connect-redis')(session);

  app = express();

  longCookieIsLong = 302400000000;

  sessionStore = session({
    store: new RedisStore(),
    secret: settings.cookie_secret,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: true,
      maxAge: new Date(Date.now() + longCookieIsLong)
    }
  });

  app.use(cookieParser(settings.cookie_secret));

  app.use(sessionStore);

  app.use(favicon(__dirname + '/public/images/favicons/favicon.ico'));

  app.use(express["static"](path.join(__dirname, "public")));

  app.set("views", path.join(__dirname, "views"));

  app.set("view engine", "ejs");

  app.use(bodyParser.json());

  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use("/", routes);

  app.use(function(req, res, next) {
    var err;
    err = new Error("Not Found");
    err.status = 404;
    return next(err);
  });

  if (app.get("env") === "development") {
    app.use(function(err, req, res, next) {
      var view;
      view = "error";
      if (err.status === 404) {
        view = "error404";
      }
      res.status(err.status || 500);
      return res.render(view, {
        message: err.message,
        error: err,
        stack: err.stack
      });
    });
  }

  app.use(function(err, req, res, next) {
    var view;
    view = "error";
    if (err.status === 404) {
      view = "error404";
    }
    res.status(err.status || 500);
    return res.render(view, {
      message: err.message,
      error: err,
      stack: err.stack
    });
  });

  app.set("port", process.env.PORT || 3000);

  server = app.listen(app.get("port"), function() {
    return console.log("Express server listening on port " + server.address().port);
  });

  require("./sockets")(server, sessionStore);

}).call(this);
