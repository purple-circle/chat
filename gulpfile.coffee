gulp = require("gulp")
plumber = require('gulp-plumber')

gutil = require("gulp-util")
coffee = require("gulp-coffee")

# Css
less = require("gulp-less")
minifycss = require("gulp-minify-css")
postcss = require("gulp-postcss")
autoprefixer = require("autoprefixer-core")


# Code linting
coffeelint = require('gulp-coffeelint')

# Code minification
concat = require("gulp-concat")
uglify = require("gulp-uglify")

# Angular
protractor = require("gulp-protractor").protractor
ngTemplates = require("gulp-ng-templates")
ngAnnotate = require('gulp-ng-annotate')

# Code analysis
plato = require("gulp-plato")

# Notifications for OSX
notify = require("gulp-notify")

fixCompare = require("gulp-fix-compare")


errorHandler = notify.onError("Error: <%= error.message %>")

gulp.task "public-coffee", ->

  # Build frontend coffee
  gulp
    .src("coffeescript/public/**/*.coffee")
    .pipe(plumber({errorHandler}))
    .pipe(coffee())
    .on('error', gutil.log)
    .pipe(ngAnnotate())
    .pipe(fixCompare())
    .pipe(concat("build.js"))
    .pipe(gulp.dest("./public/js"))


gulp.task "coffee", ->

  # Build rest
  gulp
    .src([
      "coffeescript/**/*.coffee"
      "!coffeescript/public/**/*.coffee"
    ])
    .pipe(plumber({errorHandler}))
    .pipe(coffee())
    .pipe(fixCompare())
    .on('error', gutil.log)
    .pipe(gulp.dest("./"))


gulp.task "less", ->
  gulp
    .src([
      "less/**/*.less"
      "!less/error404.less"
    ])
    .pipe(plumber({errorHandler}))
    .pipe(less())
    .pipe(concat('chat.css'))
    .pipe(gulp.dest("./public/css"))

  gulp
    .src("less/error404.less")
    .pipe(plumber({errorHandler}))
    .pipe(less())
    .pipe(gulp.dest("./public/css"))


gulp.task "autoprefixer", ->
  gulp
    .src("public/css/*.css")
    .pipe(postcss([autoprefixer(browsers: ["last 5 version"])]))
    .pipe gulp.dest("public/css")


gulp.task "partials", ->
  gulp
    .src('public/views/**/*.html')
    .pipe(ngTemplates())
    .pipe(gulp.dest("public/js/templates"))


gulp.task "test", ->
  gulp
    .src(["/test/specs/**/*.js"])
    .pipe(protractor(
      configFile: "test/conf.js"
    ))
    .pipe(plumber({errorHandler}))
    .on('error', gutil.log)


gulp.task "plato", ->
  gulp
    .src([
      "app.js"
      "routes/**/*.js"
      "public/js/build.js"
      "test/**/*.js"
    ])
    .pipe plato "public/report",
      jshint:
        options:
          strict: true
      complexity:
        trycatch: true



gulp.task "build", ->
  gulp.start("coffee")
  gulp.start("partials")
  gulp.start("less")
  gulp.start("autoprefixer")

  gulp
    .src("public/js/build.js")
    .pipe(uglify())
    .pipe(gulp.dest("public/js"))

  gulp
    .src("public/css/style.css")
    .pipe(minifycss())
    .pipe(gulp.dest("public/css"))

  gulp.start("lintcode")
  gulp.start("plato")


gulp.task "public-coffeelint", ->
  gulp
    .src("coffeescript/public/**/*.coffee")
    .pipe(plumber({errorHandler}))
    .pipe(coffeelint())
    .pipe(coffeelint.reporter())
    .on('error', gutil.log)

gulp.task "coffeelint", ->
  gulp
    .src([
      "coffeescript/**/*.coffee"
      "!coffeescript/public/**/*.coffee"
    ])
    .pipe(plumber({errorHandler}))
    .pipe(coffeelint())
    .pipe(coffeelint.reporter())
    .on('error', gutil.log)

gulp.task "lintcode", ->
  gulp.start("coffeelint")
  gulp.start("lint")


gulp.task "watch", ->
  gulp.watch "less/**/*.less", ["less"]
  gulp.watch "public/css/*.css", ["autoprefixer"]
  gulp.watch "public/views/**/*.html", ["partials"]

  gulp.watch "coffeescript/public/**/*.coffee", ["public-coffeelint", "public-coffee"]
  gulp.watch [
    "coffeescript/**/*.coffee"
    "!coffeescript/public/**/*.coffee"
    ], ["coffeelint", "coffee"]


