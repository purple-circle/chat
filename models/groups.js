(function() {
  var Q, api, groups, rejectPromise;

  Q = require("q");

  api = require("../models/api");

  groups = {};

  rejectPromise = function() {
    var deferred;
    deferred = Q.defer();
    deferred.reject();
    return deferred.promise;
  };

  groups.create = function(data) {
    return api.createQueue("api.createGroup", data).then(function(group) {
      var albumData, joinData;
      joinData = {
        group_id: group._id,
        user_id: group.created_by
      };
      albumData = joinData;
      albumData.title = "Default album";
      albumData["default"] = true;
      groups.createPictureAlbum(albumData);
      groups.joinGroup(joinData);
      return group;
    });
  };

  groups.check_group_name = function(name) {
    return api.createQueue("api.check_group_name", name);
  };

  groups.joinGroup = function(data) {
    if (!data.group_id || !data.user_id) {
      return rejectPromise();
    }
    return groups.getGroup(data.group_id).then(function(group) {
      if (!group) {
        return rejectPromise();
      }
      return api.createQueue("api.joinGroup", data);
    });
  };

  groups.createPictureAlbum = function(data) {
    if (!data.group_id || !data.user_id) {
      return rejectPromise();
    }
    return groups.getGroup(data.group_id).then(function(group) {
      if (!group) {
        return rejectPromise();
      }
      return api.createQueue("api.createGroupPictureAlbum", data);
    });
  };

  groups.leaveGroup = function(data) {
    if (!data.group_id || !data.user_id) {
      return rejectPromise();
    }
    return groups.getGroup(data.group_id).then(function(group) {
      if (!group) {
        return rejectPromise();
      }
      return api.createQueue("api.leaveGroup", data);
    });
  };

  groups.checkMembership = function(data) {
    if (!data.group_id || !data.user_id) {
      return rejectPromise();
    }
    return api.createQueue("api.checkMembership", data);
  };

  groups.getMemberList = function(id) {
    return api.createQueue("api.getMemberList", id);
  };

  groups.savePicture = function(id, data) {
    return groups.getGroup(id).then(function(group) {
      if (!group) {
        return rejectPromise();
      }
      return api.createQueue("api.saveGroupPicture", {
        id: id,
        data: data
      });
    });
  };

  groups.getPictures = function(id) {
    return api.createQueue("api.getGroupPictures", id);
  };

  groups.getPictureAlbums = function(id) {
    return api.createQueue("api.getGroupPictureAlbums", id);
  };

  groups.update = function(id, data) {
    return groups.getGroup(id).then(function(group) {
      if (!group) {
        return rejectPromise();
      }
      return api.createQueue("api.editGroup", {
        id: id,
        data: data
      });
    });
  };

  groups.getGroups = function(data) {
    return api.createQueue("api.getGroups", data);
  };

  groups.getGroup = function(id) {
    return api.createQueue("api.getGroup", id);
  };

  groups.get_group_picture = function(group_id, picture_id) {
    return api.createQueue("api.get_group_picture", {
      group_id: group_id,
      picture_id: picture_id
    });
  };

  groups.set_group_logo = function(group_id, picture_id) {
    var deferred;
    deferred = Q.defer();
    groups.get_group_picture(group_id, picture_id).then(function(picture) {
      var data;
      data = {
        logo_url: "/uploads/" + picture.filename
      };
      return groups.update(group_id, data).then(deferred.resolve, deferred.reject);
    }, deferred.reject);
    return deferred.promise;
  };

  groups.set_group_cover_picture = function(group_id, picture_id) {
    var deferred;
    deferred = Q.defer();
    groups.get_group_picture(group_id, picture_id).then(function(picture) {
      var data;
      data = {
        cover_url: "/uploads/" + picture.filename
      };
      return groups.update(group_id, data).then(deferred.resolve, deferred.reject);
    }, deferred.reject);
    return deferred.promise;
  };

  module.exports = groups;

}).call(this);
