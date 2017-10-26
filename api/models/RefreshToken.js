/**
 * RefreshToken.js
 *
 * @description :: RefreshToken 信息 in redis
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
'use strict';

module.exports = {
  connection: 'redis',
  schema: true,

  attributes: {
    userId: {
      type: 'string',
      defaultsTo: ''
    },
    clientId: {
      type: 'string',
      required: true
    },
    token: {
      type: 'string'
    }
  },

  beforeCreate: function(values, next) {
    values.token = Utils.uid(256);
    next();
  }
};
