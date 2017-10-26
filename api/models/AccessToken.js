/**
 * AccessToken.js
 *
 * @description :: accesstoken信息 in redis
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
      type: 'string',
      defaultsTo: ''
    },
    scope: {
      type: 'string',
      defaultsTo: ''
    }
  },

  beforeCreate: function(values, next) {
    values.token = Utils.uid(256);
    next();
  }
};
