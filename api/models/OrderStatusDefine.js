/**
* OrderStatusDefine.js
*
* @description :: 订单流程定义表
* @docs        :: http://sailsjs.org/#!documentation/models
*/
'use strict';

function updateCache(values, next) {
  async.auto({
    userStatus: function userStatusFn(callback) {
      GlobalData.update('userStatus', values, callback);
    },
    coachStatus: function coachStatusFn(callback) {
      GlobalData.update('coachStatus', values, callback);
    }
  }, function(err, results) {
    if (err) {
      return next(err);
    }
    return next(null, results);
  });
}

module.exports = {
  schema: true,
  autoPK: false,

  attributes: {
    id: {
      type: 'string',
      primaryKey: true
    },
    // 默认状态信息
    base: {
      type: 'json',
      defaultsTo: []
    },
    // 用户教练订单
    userCoachOrder: {
      type: 'json',
      defaultsTo: []
    },
    // 用户场馆订单
    userSportsOrder: {
      type: 'json',
      defaultsTo: []
    },
    // 教练端订单
    coachCoachOrder: {
      type: 'json',
      defaultsTo: []
    },
    // 场地订单状态定义
    sportsOrderStatus: {
      type: 'string',
      defaultsTo: ''
    },
    // 教练订单状态定义
    coachOrderStatus: {
      type: 'string',
      defaultsTo: ''
    }
  },
  afterCreate: function(values, next) {
    updateCache(values, next);
  },
  afterUpdate: function(values, next) {
    updateCache(values, next);
  }
};
