/**
 * Notification.js
 *
 * @description :: 通知信息类
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
    // ios设备
    ios: {
      type: 'string',
      defaultsTo: ''
    },
    // 安卓设备
    android: {
      type: 'string',
      defaultsTo: ''
    },
    // 内容
    content: {
      type: 'string',
      defaultsTo: ''
    },
    // 计划中
    scheduled: {
      type: 'boolean',
      defaultsTo: true
    },
    // 是否发送成功
    success: {
      type: 'boolean',
      defaultsTo: false
    },
    // 发送结果
    result: {
      type: 'json',
      defaultsTo: {}
    }
  }
};
