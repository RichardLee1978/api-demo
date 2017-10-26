/**
 * OrderStatus.js
 *
 * @description :: 订单状态记录缓存表，用于快速查询
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
'use strict';

module.exports = {
  connection: 'redis',
  schema: true,

  attributes: {
    order: {
      type: 'string',
      defaultsTo: ''
    },
    type: {
      type: 'string',
      defaultsTo: ''
    },
    orderStatus: {
      type: 'string',
      defaultsTo: ''
    },
    paidStatus: {
      type: 'string',
      defaultsTo: ''
    },
    expireTime: 'datetime'
  }
};
