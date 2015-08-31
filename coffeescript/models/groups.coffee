Q = require('q')
api = require('../models/api')
groups = {}

rejectPromise = ->
  deferred = Q.defer()
  deferred.reject()
  deferred.promise

groups.create = (data) ->
  api
    .createQueue('api.createGroup', data)
    .then (group) ->
      joinData =
        group_id: group._id
        user_id: group.created_by

      albumData = joinData
      albumData.title = 'Default album'
      albumData.default = true

      groups.createPictureAlbum(albumData)
      groups.joinGroup(joinData)
      group

groups.check_group_name = (name) ->
  api.createQueue('api.check_group_name', name)

groups.joinGroup = (data) ->
  if not data.group_id or not data.user_id
    return rejectPromise()

  groups
    .getGroup(data.group_id)
    .then (group) ->
      if not group
        return rejectPromise()

      api.createQueue('api.joinGroup', data)

groups.createPictureAlbum = (data) ->
  if not data.group_id or not data.user_id
    return rejectPromise()

  groups
    .getGroup(data.group_id)
    .then (group) ->
      if not group
        return rejectPromise()

      api.createQueue('api.createGroupPictureAlbum', data)


groups.leaveGroup = (data) ->
  if not data.group_id or not data.user_id
    return rejectPromise()

  groups
    .getGroup(data.group_id)
    .then (group) ->
      if not group
        return rejectPromise()

      api.createQueue('api.leaveGroup', data)


groups.checkMembership = (data) ->
  if not data.group_id or not data.user_id
    return rejectPromise()

  api.createQueue('api.checkMembership', data)


groups.getMemberList = (id) ->
  api.createQueue('api.getMemberList', id)


groups.savePicture = (id, data) ->
  groups
    .getGroup(id)
    .then (group) ->
      if not group
        return rejectPromise()

      api.createQueue('api.saveGroupPicture', {id, data})

groups.getPictures = (id) ->
  api.createQueue('api.getGroupPictures', id)

groups.getPictureAlbums = (id) ->
  api.createQueue('api.getGroupPictureAlbums', id)

groups.update = (id, data) ->
  groups
    .getGroup(id)
    .then (group) ->
      if not group
        return rejectPromise()

      # TODO: logo and cover picture edit need to set edited by or then rethink this
      #if group.created_by isnt data.edited_by
      #  return rejectPromise()

      api.createQueue('api.editGroup', {id, data})

groups.getGroups = (data) ->
  api.createQueue('api.getGroups', data)

groups.getGroup = (id) ->
  api.createQueue('api.getGroup', id)

groups.get_group_picture = (group_id, picture_id) ->
  api.createQueue('api.get_group_picture', {group_id, picture_id})

groups.set_group_logo = (group_id, picture_id) ->
  deferred = Q.defer()

  groups
    .get_group_picture(group_id, picture_id)
    .then (picture) ->
      data =
        logo_url: "/uploads/#{picture.filename}"

      groups
        .update(group_id, data)
        .then deferred.resolve, deferred.reject

    , deferred.reject

  deferred.promise

groups.set_group_cover_picture = (group_id, picture_id) ->
  deferred = Q.defer()

  groups
    .get_group_picture(group_id, picture_id)
    .then (picture) ->
      data =
        cover_url: "/uploads/#{picture.filename}"

      groups
        .update(group_id, data)
        .then deferred.resolve, deferred.reject

    , deferred.reject

  deferred.promise




module.exports = groups
