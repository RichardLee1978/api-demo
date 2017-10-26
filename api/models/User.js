/**
 * User.js
 *
 * @description :: 用户类
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
'use strict';

var bcrypt = require('bcrypt');

function hashPassword(values, next) {
  if (!_.has(values, 'fixPassword')) {
    values.fixPassword = false;
  }
  bcrypt.hash(values.password, 10, function(err, hash) {
    if (err) {
      return next(err);
    }
    values.password = hash;
    next();
  });
}

function hasUnSafeKeys(populateKeys) {
  var allowkeys = _.pluck(sails.models.user.associations, 'alias');
  var blocks = _.filter(populateKeys, function(key) {
    return _.indexOf(allowkeys, key) === -1;
  });
  return !_.isEmpty(blocks);
}

module.exports = {
  schema: true,
  autoPK: false,

  attributes: {
    id: {
      type: 'string',
      primaryKey: true
    },
    // 手机号/用户名
    username: 'string',
    // 密码
    password: 'string',
    // 认证教练
    verifyCoach: {
      type: 'boolean',
      defaultsTo: false
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    // 区号
    area: {
      type: 'integer',
      defaultsTo: 86
    },
    // 是否强制修改密码
    // 当从后台设置或者初始化密码的时候，设置 fixPassword 为 true，则客户端在下次登录时需要用户重设密码
    fixPassword: {
      type: 'boolean',
      defaultsTo: false
    },
    // 被屏蔽的理由
    blockReason: {
      type: 'string',
      defaultsTo: ''
    },

    info: {
      model: 'userinfo'
    },
    extra: {
      model: 'userextra'
    },
    easemob: {
      model: 'usereasemob'
    },
    coachInfo: {
      model: 'coachinfo'
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.password;
      if (_.isString(obj.info)) {
        delete obj.info;
      }
      if (_.isString(obj.extra)) {
        delete obj.extra;
      }
      if (_.isString(obj.easemob)) {
        delete obj.easemob;
      }
      if (_.isString(obj.coachInfo)) {
        delete obj.coachInfo;
      }
      delete obj.updatedAt;
      return obj;
    }
  },

  beforeCreate: function(values, next) {
    hashPassword(values, next);
  },
  afterCreate: function(record, next) {
    User.update(record.id, {
      info: record.id,
      extra: record.id,
      easemob: record.id
    }).exec(next);
  },
  beforeUpdate: function(values, next) {
    if (values.password) {
      hashPassword(values, next);
    } else {
      return next();
    }
  },

  withId: function(isSelf, userId, where, populateKeys, needPhone, callback) {
    if (_.isFunction(needPhone)) {
      callback = needPhone;
      needPhone = false;
    }
    if (hasUnSafeKeys(populateKeys)) {
      return callback(Utils.error('use error user attribute'));
    }
    var needCoach = _.indexOf(populateKeys, 'coachInfo') > -1;
    var qobj;
    if (!_.isEmpty(where)) {
      if (!_.isEmpty(userId)) {
        where.id = userId;
      }
      qobj = User.findOne(where);
    } else {
      qobj = User.findOne(userId);
    }
    if (populateKeys) {
      populateKeys.forEach(function(key) {
        qobj.populate(key);
      });
    }
    if (isSelf) {
      qobj.populate('easemob');
    }
    qobj.exec(function(err, user) {
      if (err) {
        return callback(err);
      }
      if (!user) {
        if (needCoach) {
          return callback(Utils.error(400004));
        } else {
          return callback(Utils.error(400038));
        }
      }
      if (!user.enabled) {
        if (needCoach) {
          return callback(Utils.error(400049));
        } else {
          return callback(Utils.error(400040));
        }
      }

      if (!isSelf) {
        if (!needPhone) {
          delete user.username;
        }
        if (_.has(user, 'info') && !needPhone) {
          delete user.info.realname;
        }
        if (_.has(user, 'extra')) {
          delete user.extra.atNearby;
          delete user.extra.thirdParty;
          delete user.extra.lastContact;
        }
      }
      return callback(null, user.toJSON());
    });
  },
  withIds: function(userIds, where, populateKeys, needPhone, callback) {
    if (_.isFunction(needPhone)) {
      callback = needPhone;
      needPhone = false;
    }
    if (hasUnSafeKeys(populateKeys)) {
      return callback(Utils.error('use error user attribute'));
    }
    var qobj;
    if (!_.isEmpty(where)) {
      if (!_.isEmpty(userIds)) {
        where.id = userIds;
      }
      qobj = User.find(where);
    } else {
      qobj = User.find(userIds);
    }
    if (populateKeys) {
      populateKeys.forEach(function(key) {
        qobj.populate(key);
      });
    }
    qobj.exec(function(err, result) {
      if (err) {
        return callback(err);
      }
      async.map(result, function(user, innercb) {
        if (!needPhone) {
          delete user.username;
        }
        if (_.has(user, 'info') && !needPhone) {
          delete user.info.realname;
        }
        if (_.has(user, 'extra')) {
          delete user.extra.atNearby;
          delete user.extra.thirdParty;
          delete user.extra.lastContact;
        }
        return innercb(null, user.toJSON());
      }, function(error, users) {
        var temp = _.indexBy(users, 'id');
        return callback(error, temp);
      });
    });
  }
};
