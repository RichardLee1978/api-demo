/**
 * AuthCode.js
 *
 * @description :: AuthCode 信息 in redis
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
'use strict';

module.exports = {
  connection: 'redis',
  schema: true,

  attributes: {
    code: {
      type: 'string',
      defaultsTo: ''
    },
    userId: {
      type: 'string',
      defaultsTo: ''
    },
    clientId: {
      type: 'string',
      defaultsTo: ''
    },
    redirectURI: {
      type: 'string',
      defaultsTo: ''
    },
    scope: {
      type: 'string',
      defaultsTo: ''
    }
  },

  beforeCreate: function(values, next) {
    values.code = Utils.uid(16);
    next();
  }
};
