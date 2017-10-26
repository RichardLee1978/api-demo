'use strict';

exports.createTag = function(userId, title, type, callback) {
  Tag.findOne({
    title: title
  }).exec(function(err, tag) {
    if (err) {
      return callback(err);
    }
    if (!tag) {
      Tag.create({
        createdBy: userId,
        title: title,
        type: type
      }).exec(callback);
    }
    if (!tag.enabled) {
      tag.enabled = true;
      tag.save(callback);
    }
    return callback(Utils.error(400034));
  });
};

exports.list = function(type, recommend, lastdate, skip, cb) {
  var filterObj = {
    where: {
      type: type,
      enabled: true
    },
    limit: Constant.listLimit * 3,
    skip: skip,
    sort: {
      'createdAt': 1
    }
  };
  if (lastdate) {
    filterObj.where.updatedAt = {
      '>': lastdate
    };
  }
  if (recommend) {
    filterObj.where.recommend = true;
  }
  async.auto({
    total: function totalFn(callback) {
      Tag.count(filterObj.where).exec(callback);
    },
    list: [
      'total',
      function listFn(callback, result) {
        if (!result.total) {
          return callback(null, []);
        }
        Tag.find(filterObj)
          .skip(skip)
          .limit(Constant.listLimit * 3)
          .exec(callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results);
  });
};
