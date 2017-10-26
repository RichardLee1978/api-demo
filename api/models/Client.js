/**
 * Client.js
 *
 * @description :: 客户端信息 in redis
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
'use strict';

module.exports = {
  connection: 'redis',
  schema: true,

  attributes: {
    // 客户端类型
    type: {
      type: 'string',
      defaultsTo: ''
    },
    // 设备名称
    deviceName: {
      type: 'string',
      defaultsTo: ''
    },
    // 设备版本
    deviceVersion: {
      type: 'string',
      defaultsTo: ''
    },
    // 设备系统版本
    deviceOsVersion: {
      type: 'string',
      defaultsTo: ''
    },
    // 设备标示
    deviceIdentify: {
      type: 'string',
      defaultsTo: ''
    },
    // 程序版本
    version: {
      type: 'string',
      defaultsTo: ''
    },
    // 绑定用户
    userId: {
      type: 'string',
      defaultsTo: ''
    },
    // 客户端id
    clientId: {
      type: 'string',
      defaultsTo: ''
    },
    // 客户端密钥
    clientSecret: {
      type: 'string',
      defaultsTo: ''
    },
    // 导向URL
    redirectURI: {
      type: 'string',
      defaultsTo: ''
    },
    // 是否信任
    trusted: {
      type: 'boolean',
      defaultsTo: true
    }
  },

  beforeCreate: function(values, next) {
    values.clientId = ObjectID.id();
    var str = `${values.type}|${values.deviceVersion}|${values.deviceIdentify}`;
    values.clientSecret = Utils.encrypt(str, values.clientId);
    next();
  }
};
