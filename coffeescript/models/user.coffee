Q = require("q")
api = require("../models/api")
user = {}

rejectPromise = ->
  deferred = Q.defer()
  deferred.reject()
  deferred.promise


user.create_default_picture_album = (userid) ->
  album_data =
    user_id: result._id
    title: "Default album"
    default: true

  user.create_picture_album(album_data)

user.check_username = (username) ->
  api.createQueue("api.check_username", username)

user.create = (data) ->
  deferred = Q.defer()
  api
    .createQueue("api.createUser", data)
    .then (result) ->
      user
        .create_default_picture_album(result._id)
        .then ->
          deferred.resolve(result)

    , deferred.reject

  deferred.promise

user.edit = (id, data) ->
  api.createQueue("api.edit_user", {id, data})

user.localSignup = (data) ->
  deferred = Q.defer()
  api
    .createQueue("api.localSignupUser", data)
    .then (result) ->
      user
        .create_default_picture_album(result._id)
        .then ->
          deferred.resolve(result)

    , deferred.reject

  deferred.promise

user.getUser = (id) ->
  api.createQueue("api.getUser", {_id: id})

user.savePicture = (id, data) ->
  user
    .getUser(id)
    .then (profile) ->
      if !profile
        return rejectPromise()

      api.createQueue("api.saveProfilePicture", {id, data})

user.getPictures = (id) ->
  api.createQueue("api.getProfilePictures", id)

user.create_picture_album = (data) ->
  if !data.user_id
    return rejectPromise()

  api.createQueue("api.create_profile_picture_album", data)

user.get_profile_picture_albums = (id) ->
  api.createQueue("api.get_profile_picture_albums", id)


user.get_profile_picture = (user_id, picture_id) ->
  api.createQueue("api.get_profile_picture", {user_id, picture_id})

user.set_profile_picture = (user_id, picture_id) ->
  deferred = Q.defer()

  user
    .get_profile_picture(user_id, picture_id)
    .then (picture) ->
      data =
        picture_url: "/uploads/#{picture.filename}"

      user
        .edit(user_id, data)
        .then deferred.resolve, deferred.reject

    , deferred.reject

  deferred.promise

user.set_cover_picture = (user_id, picture_id) ->
  deferred = Q.defer()

  user
    .get_profile_picture(user_id, picture_id)
    .then (picture) ->
      data =
        cover_url: "/uploads/#{picture.filename}"

      user
        .edit(user_id, data)
        .then deferred.resolve, deferred.reject

    , deferred.reject

  deferred.promise


module.exports = user