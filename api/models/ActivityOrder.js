/**
* ActivityOrder.js
*
* @description :: 活动订单
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
    // 订单号
    orderNo: {
      type: 'string',
      defaultsTo: ''
    },
    // 用户
    user: {
      model: 'user'
    },
    // 活动
    activity: {
      model: 'activity'
    },
    // 预定人姓名
    name: {
      type: 'string',
      defaultsTo: ''
    },
    // 电话
    phone: {
      type: 'string',
      defaultsTo: ''
    },
    // 金额
    amount: {
      type: 'float',
      defaultsTo: 0
    },
    // 备注
    remark: {
      type: 'string',
      defaultsTo: ''
    },
    // 订单状态
    orderStatus: {
      type: 'string',
      defaultsTo: 'to_be_accepted'
    },
    // 付款状态
    paidStatus: {
      type: 'string',
      defaultsTo: 'to_pay'
    },
    // 支付方式
    payment: {
      type: 'string',
      defaultsTo: 'alipay'
    },
    // 支付单号
    paymentNumber: {
      type: 'string',
      defaultsTo: ''
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },

    // 参加者
    participants: {
      collection: 'activityparticipant',
      via: 'order'
    },
    // 详情
    detail: {
      collection: 'activityorderdetail',
      via: 'order'
    }
  },
  beforeCreate: function(values, next) {
    next();
  },
  beforeUpdate: function(values, next) {
    next();
  }
};
