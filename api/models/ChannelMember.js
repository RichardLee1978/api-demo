/**
 * ChannelMember.js
 *
 * @description :: 聊天频道成员类
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
    // 频道
    channel: {
      model: 'channel'
    },
    // 用户
    user: {
      model: 'user'
    },
    // 邀请人
    inviter: {
      model: 'user'
    },
    // 邀请状态
    invitestatus: {
      type: 'string',
      defaultsTo: 'wait'
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    }
  }
};
