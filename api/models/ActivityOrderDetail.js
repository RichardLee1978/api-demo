/**
* ActivityOrderDetail.js
*
* @description :: 活动订单详情类
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
    // 对应订单
    order: {
      model: 'activityorder'
    },
    // 条目金额
    amount: {
      type: 'float',
      defaultsTo: 0
    },
    // 对应项目
    event: {
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
      via: 'orderdetail'
    }
  },
  afterCreate: function(record, next) {
    ActivityOrder.findOne(record.order).exec(function(err, order) {
      if (err) {
        return next(err);
      }
      Activity.findOne(order.activity).populateAll().exec(function(_err, aObj) {
        if (_err) {
          return callback(_err);
        }
        var events = aObj[aObj.type];
        var eObj = _.find(events, {
          id: record.event
        });
        eObj.signed++;
        eObj.save(next);
      });
    });
  }
};
