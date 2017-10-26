/**
* UserInviteLog.js
*
* @description :: 用户邀请信息记录类
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
    inviter: {
      model: 'user'
    },
    invitees: {
      model: 'user'
    },
    result: {
      type: 'boolean',
      defaultsTo: false
    }
  },
  beforeCreate: function(values, next) {
    next();
  },
  beforeUpdate: function(values, next) {
    next();
  }
};
