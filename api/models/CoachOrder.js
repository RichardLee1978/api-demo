/**
 * CoachOrder.js
 *
 * @description :: 教练订单类
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
    // 学员
    user: {
      model: 'user'
    },
    // 教练
    coach: {
      model: 'user'
    },
    // 开始时间
    startTime: {
      type: 'datetime',
      defaultsTo: ''
    },
    // 结束时间
    endTime: {
      type: 'datetime',
      defaultsTo: ''
    },
    // 金额
    amount: {
      type: 'integer',
      defaultsTo: 0
    },
    // 地点
    location: {
      model: 'customlocation'
    },
    // 场馆
    venue: {
      model: 'venue'
    },
    // 项目
    trainCase: {
      model: 'traincase'
    },
    // 目标
    trainTarget: {
      type: 'json',
      defaultsTo: []
    },
    // 实际
    trainActual: {
      type: 'json',
      defaultsTo: []
    },
    // 备注
    remark: {
      type: 'string',
      defaultsTo: ''
    },
    // 建议心率
    heartRate: {
      type: 'integer',
      defaultsTo: 0
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
    // 拒绝/取消理由
    reason: {
      type: 'string',
      defaultsTo: ''
    },
    // 联系电话
    phone: {
      type: 'string',
      defaultsTo: ''
    },

    detail: {
      collection: 'coachorderdetail',
      via: 'order'
    }
  },
  beforeCreate: function(values, next) {
    async.auto({
      targets: function targetsFn(callback) {
        ObjectCache.findOneByType('cases').exec(function(err, obj) {
          if (err) {
            return callback(err);
          }
          var targets = obj.data[values.trainCase].target;
          targets = _.map(targets, function(key) {
            return {
              id: key,
              value: 0
            };
          });
          values.trainTarget = targets;
          callback(null, null);
        });
      },
      phone: function phoneFn(callback) {
        User.findOne(values.user).exec(function(err, user) {
          if (err) {
            return callback(err);
          }
          values.phone = user.username;
          callback(null, null);
        });
      }
    }, function(err) {
      if (err) {
        return next(err);
      }
      return next();
    });
  },
  afterCreate: function(record, next) {
    async.auto({
      memoryStatus: function memoryStatusFn(callback) {
        var moment = require('moment');
        OrderStatus.create({
          order: record.id,
          type: 'coachorder',
          orderStatus: record.orderStatus,
          paidStatus: record.paidStatus,
          expireTime: moment(record.createdAt).add(Constant.coachOrderTimeLimit, 'm').toDate()
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
    async.auto({
      memoryStatus: function memoryStatusFn(callback) {
        if (!values.paidStatus && !values.orderStatus) {
          return callback(null, null);
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
          }, obj).exec(callback);
        } else {
          return callback(null, null);
        }
      },
      order: function orderFn(callback) {
        if (values.orderStatus === 'cancelled') {
          CoachSchedule.update({
            order: values.id
          }, {
            enabled: false
          }).exec(callback);
        } else {
          callback(null, null);
        }
      },
      details: function detailsFn(callback) {
        CoachOrderDetail.update({
          order: values.id
        }, {
          enabled: false
        }).exec(callback);
      }
    }, function(err) {
      if (err) {
        return next(err);
      }
      return next();
    });
  }
};
