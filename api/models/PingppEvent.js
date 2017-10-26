/**
* PingppEvent.js
*
* @description :: pingpp事件类
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
    eventId: {
      type: 'string',
      defaultsTo: ''
    },
    eventCreated: {
      type: 'integer',
      defaultsTo: 0
    },
    livemode: {
      type: 'boolean',
      defaultsTo: ''
    },
    object: {
      type: 'string',
      defaultsTo: ''
    },
    data: {
      type: 'json',
      defaultsTo: ''
    },
    pendingWebhooks: {
      type: 'integer',
      defaultsTo: 0
    },
    request: {
      type: 'string',
      defaultsTo: ''
    }
  },
  beforeCreate: function(values, next) {
    next();
  },
  beforeUpdate: function(values, next) {
    next();
  }
};
