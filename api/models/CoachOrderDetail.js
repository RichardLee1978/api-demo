/**
 * CoachOrderDetail.js
 *
 * @description :: 教练订单详情
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
    // 订单
    order: {
      model: 'coachorder'
    },
    // 日期
    date: {
      type: 'integer',
      defaultsTo: 0
    },
    // 开始时间
    from: {
      type: 'integer',
      defaultsTo: 0
    },
    // 结束时间
    to: {
      type: 'integer',
      defaultsTo: 0
    },
    // 是否完成
    finish: {
      type: 'boolean',
      defaultsTo: false
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    }
  }
};
