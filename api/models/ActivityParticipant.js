/**
* ActivityParticipant.js
*
* @description :: 活动订单参与者类
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
    // 关联订单
    order: {
      model: 'activityorder'
    },
    // 关联订单项
    orderdetail: {
      model: 'activityorderdetail'
    },
    // 关联用户
    user: {
      model: 'user'
    },
    // 所属组别
    team: {
      type: 'string',
      defaultsTo: ''
    },
    // 参加者名字
    name: {
      type: 'string',
      defaultsTo: ''
    },
    // 电话
    phone: {
      type: 'string',
      defaultsTo: ''
    },
    // 生日
    birthday: {
      type: 'string',
      defaultsTo: ''
    },
    // 性别
    gender: {
      type: 'string',
      defaultsTo: ''
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    }
  },
  beforeCreate: function(values, next) {
    next();
  },
  beforeUpdate: function(values, next) {
    next();
  }
};
