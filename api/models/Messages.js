/**
 * Messages.js
 *
 * @description :: 聊天信息类
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
    // 发送人
    sender: 'string',
    // 接收人
    receiver: {
      type: 'string',
      defaultsTo: ''
    },
    // 接收频道
    group: {
      type: 'string',
      defaultsTo: '',
    },
    // 信息类型
    type: 'string',
    // 文本内容
    text: {
      type: 'string',
      defaultsTo: ''
    },
    // 图片内容
    picture: {
      type: 'string',
      defaultsTo: ''
    },
    // 表情哪容
    emoji: {
      type: 'string',
      defaultsTo: ''
    },
    // 语音内容
    sound: {
      type: 'string',
      defaultsTo: ''
    },
    // 系统内容
    system: {
      type: 'string',
      defaultsTo: ''
    },
    // 扩展内容
    extra: {
      type: 'string',
      defaultsTo: ''
    },
    // 发送方删除
    senddelete: {
      type: 'boolean',
      defaultsTo: false
    },
    // 接收方删除
    receivedelete: {
      type: 'boolean',
      defaultsTo: false
    },
  }
};
