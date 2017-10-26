/**
 * Event.js
 *
 * @description :: 项目类
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
    // 所属运动馆
    venue: {
      model: 'venue'
    },
    // 类别
    category: {
      type: 'string'
    },
    // 电话
    phone: {
      type: 'string',
      defaultsTo: ''
    },
    // 容纳人数
    volume: {
      type: 'string',
      defaultsTo: ''
    },
    // 描述
    description: {
      type: 'text',
      defaultsTo: ''
    },
    // 预订类型
    planType: {
      type: 'string',
      defaultsTo: 'ground',
      enum: ['ground', 'ticket']
    },
    // 预订最小时长单位
    planMinLength: {
      type: 'integer',
      defaultsTo: 1
    },
    // 预订追加时长单位
    planExtendLength: {
      type: 'integer',
      defaultsTo: 1
    },
    // 预订均价
    planPrice: 'integer',
    // 预订须知
    attention: {
      type: 'text',
      defaultsTo: ''
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    displayOrder: {
      type: 'integer',
      defaultsTo: 100
    },
    // 营业时间
    opentime: {
      type: 'string',
      defaultsTo: '0900'
    },
    closetime: {
      type: 'string',
      defaultsTo: '2200'
    },

    tickets: {
      collection: 'ticket',
      via: 'event'
    },
    grounds: {
      collection: 'ground',
      via: 'event'
    },
    charges: {
      collection: 'venuecharge',
      via: 'event'
    },
    orders: {
      collection: 'sportsorder',
      via: 'event'
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.createdAt;
      delete obj.updatedAt;
      delete obj.displayOrder;
      return obj;
    }
  }
};
