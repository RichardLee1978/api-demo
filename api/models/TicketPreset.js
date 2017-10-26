/**
 * TicketPreset.js
 *
 * @description :: 票仓预设类
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
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    // 标题
    title: {
      type: 'string',
      defaultsTo: ''
    },
    // 描述
    description: {
      type: 'string',
      defaultsTo: ''
    },
    // 购票须知
    attention: {
      type: 'string',
      defaultsTo: ''
    },
    // 星期
    week: {
      type: 'string',
      defaultsTo: '1234560' // 1, 2, 3, 4, 5, 6, 0
    },
    // 日期
    date: {
      type: 'string',
      defaultsTo: '' // 8位数字年月日，逗号分隔
    },
    // 开始时间
    beginTime: {
      type: 'integer',
      defaultsTo: 0
    },
    // 结束时间
    endTime: {
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
    // 数量
    quantity: {
      type: 'integer',
      defaultsTo: 0
    }
  }
};
