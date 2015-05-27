Q = require("q")
api = require("../models/api")
imgur = {}

imgur.save = (data) ->
  api.createQueue("api.save_imgur", data)

module.exports = imgur