/**
 * UserDevice.js
 *
 * @description :: 用户设备类
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
'use strict';

module.exports = {
  autoPK: false,
  schema: true,

  attributes: {
    id: {
      type: 'string',
      primaryKey: true
    },
    // 用户
    user: {
      model: 'user'
    },
    // 对应app
    app: {
      type: 'string',
      defaultsTo: ''
    },
    // 设备类型
    type: {
      type: 'string',
      defaultsTo: ''
    },
    // token
    token: {
      type: 'string',
      defaultsTo: ''
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    }
  }
};
