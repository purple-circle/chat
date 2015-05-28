require('newrelic')
express = require("express")
path = require("path")
favicon = require("serve-favicon")
logger = require("morgan")
cookieParser = require("cookie-parser")
bodyParser = require("body-parser")
passport = require("passport")
settings = require("./settings")


require("./mongo")(settings)

# Routes
routes = require("./routes/index")
session = require("express-session")

RedisStore = require('connect-redis')(session)


app = express()

longCookieIsLong = 302400000000 # about ten years or something

sessionStore = session
  store: new RedisStore()
  secret: settings.cookie_secret
  resave: true
  saveUninitialized: true
  cookie:
    maxAge: new Date(Date.now() + longCookieIsLong)

app.use cookieParser(settings.cookie_secret)
app.use sessionStore

app.use favicon(__dirname + '/public/images/favicons/favicon.ico')

# view engine setup
app.use express.static(path.join(__dirname, "public"))
app.set "views", path.join(__dirname, "views")
app.set "view engine", "ejs"
app.use bodyParser.json()
app.use bodyParser.urlencoded(extended: true)


app.use "/", routes

#/ catch 404 and forwarding to error handler
app.use (req, res, next) ->
  err = new Error("Not Found")
  err.status = 404
  next err


# development error handler
# will print stacktrace
if app.get("env") is "development"
  app.use (err, req, res, next) ->
    view = "error"
    if err.status is 404
      view = "error404"

    res.status err.status or 500
    res.render view,
      message: err.message
      error: err
      stack: err.stack


# production error handler
# no stacktraces leaked to user
app.use (err, req, res, next) ->
  view = "error"
  if err.status is 404
    view = "error404"

  res.status err.status or 500
  res.render view,
    message: err.message
    #error: {}
    error: err
    stack: err.stack


app.set "port", process.env.PORT or 3000
server = app.listen app.get("port"), ->
  console.log "Express server listening on port " + server.address().port


require("./sockets")(server, sessionStore)
