/**
 * SmsRecord.js
 *
 * @description :: 短信类
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
    // 短信类型
    type: 'string',
    // 电话号码
    phone: {
      type: 'string',
      defaultsTo: ''
    },
    // 内容
    content: {
      type: 'string',
      defaultsTo: ''
    },
    // 发送时间
    time: 'datetime',
    // 状态
    status: {
      type: 'boolean',
      defaultsTo: true
    },
    // 返回值
    response: {
      type: 'text',
      defaultsTo: ''
    }
  }
};
