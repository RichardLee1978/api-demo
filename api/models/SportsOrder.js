/**
 * SportsOrder.js
 *
 * @description :: 订单类
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
    // 订单类型
    type: {
      type: 'string'
    },
    // 预订用户
    user: {
      model: 'user'
    },
    // 预订人姓名
    name: 'string',
    // 预订手机号
    phone: 'string',
    // 运动馆
    venue: {
      model: 'venue'
    },
    // 项目
    event: {
      model: 'event'
    },
    // 开始时间
    startTime: 'datetime',
    // 结束时间
    endTime: 'datetime',
    // 人数
    people: 'integer',
    // 订单总金额
    amount: 'float',
    // 订单总数量
    quantity: {
      type: 'integer',
      defaultsTo: 1
    },
    // 已支付
    paid: {
      type: 'boolean',
      defaultsTo: false
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
    // 订单状态
    orderStatus: {
      type: 'string',
      defaultsTo: 'to_be_accepted'
    },
    // 支付状态
    paidStatus: {
      type: 'string',
      defaultsTo: 'to_pay'
    },
    // 附言
    comment: {
      type: 'string',
      defaultsTo: ''
    },
    ground: {
      model: 'ground'
    },
    groundAmount: {
      type: 'integer'
    },
    ticket: {
      type: 'json',
      defaultsTo: []
    },
    // [{id:chargeid,count:2},...]
    charges: {
      type: 'json',
      defaultsTo: []
    },
    promotionCode: {
      type: 'string',
      defaultsTo: ''
    }
  },
  afterCreate: function(record, next) {
    async.auto({
      memoryStatus: function memoryStatusFn(callback) {
        var moment = require('moment');
        OrderStatus.create({
          order: record.id,
          type: 'sportsorder',
          orderStatus: record.orderStatus,
          paidStatus: record.paidStatus,
          expireTime: moment(record.createdAt).add(Constant.sportsOrderTimeLimit,
            'm').toDate()
        }).exec(callback);
      }
    }, function(err) {
      if (err) {
        return next(err);
      }
      return next();
    });
  },
  beforeUpdate: function(values, next) {
    if (!values.paidStatus && !values.orderStatus) {
      return next(null, null);
    }
    if (values.orderStatus !== 'cancelled' &&
        values.paidStatus !== 'pay_cancelled') {
      var obj = {};
      if (values.paidStatus) {
        obj.paidStatus = values.paidStatus;
      }
      if (values.orderStatus) {
        obj.orderStatus = values.orderStatus;
      }
      OrderStatus.update({
        order: values.id
      }, obj).exec(next);
    } else {
      return next(null, null);
    }
  }
};
