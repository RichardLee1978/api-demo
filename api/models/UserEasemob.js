/**
 * UserEasemob.js
 *
 * @description :: 用户环信信息类
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
'use strict';

module.exports = {
  schema: true,
  autoPK: false,

  attributes: {
    id: {
      type: 'string',
      primaryKey: true
    },
    nickname: {
      type: 'string'
    },
    password: {
      type: 'string'
    },
    success: {
      type: 'boolean',
      defaultsTo: false
    },
    toJSON: function() {
      var obj = this.toObject();
      delete obj.id;
      delete obj.nickname;
      delete obj.success;
      delete obj.createdAt;
      delete obj.updatedAt;
      return obj;
    }
  },
  afterCreate: function(record, next) {
    EaseMob.createUser(record, function(err) {
      if (err) {
        return next(err);
      }
      UserEasemob.update(record.id, {
        success: true,
        password: Utils.encrypt(record.password, record.id)
      }).exec(next);
    });
  },
  afterUpdate: function(record, next) {
    EaseMob.updateNickname(record, next);
  }
};
