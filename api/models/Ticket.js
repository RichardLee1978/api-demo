/**
 * Ticket.js
 *
 * @description :: 票仓类
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
    // 所属项目
    event: {
      model: 'event'
    },
    // 票仓预设
    preset: {
      model: 'ticketpreset'
    },
    // 日期
    date: {
      type: 'string',
      defaultsTo: ''
    },
    // 时段
    time: {
      type: 'string',
      defaultsTo: ''
    },
    // 剩余数量
    remain: {
      type: 'integer',
      defaultsTo: 0
    },
    // 正常金额
    normalPrice: {
      type: 'float'
    },
    // 优惠金额
    promotionPrice: {
      type: 'float'
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    }
  }
};
