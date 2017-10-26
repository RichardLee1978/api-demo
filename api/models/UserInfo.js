/**
 * UserInfo.js
 *
 * @description :: 用户信息
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
    // 昵称
    nickname: {
      type: 'string',
      defaultsTo: ''
    },
    // 真名
    realname: {
      type: 'string',
      defaultsTo: ''
    },
    // 性别
    gender: {
      type: 'string',
      defaultsTo: '',
      enum: ['male', 'female']
    },
    // 出生日期
    birthday: {
      type: 'string',
      defaultsTo: ''
    },
    // 头像
    avatar: {
      type: 'string',
      defaultsTo: ''
    },
    // 城市
    city: {
      type: 'integer',
      defaultsTo: 0
    },
    // 所在区域
    district: {
      type: 'integer',
      defaultsTo: 0
    },
    // 喜爱的运动
    favoriteSports: {
      type: 'json',
      defaultsTo: []
    },
    // 资料页背景图片
    backgroundImage: {
      type: 'string',
      defaultsTo: ''
    },
    // 身体数据
    bodyData: {
      type: 'json',
      defaultsTo: {}
    },
    toJSON: function() {
      var obj = this.toObject();
      delete obj.id;
      delete obj.createdAt;
      delete obj.updatedAt;
      return obj;
    }
  }
};
