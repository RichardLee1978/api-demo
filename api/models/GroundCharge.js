/**
 * GroundCharge.js
 *
 * @description :: 场地费用类
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
    // 所属场地
    ground: {
      model: 'ground'
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    // 星期与日期互斥
    // 如果星期和日期是默认值，则为通用纪录
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
    // 默认纪录的开始结束时间应该为0
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
      type: 'float',
      defaultsTo: 0
    },
    // 优惠金额
    promotionPrice: {
      type: 'float',
      defaultsTo: 0
    },
    // 描述
    description: {
      type: 'text',
      defaultsTo: ''
    },
    toJSON: function() {
      var obj = {};
      obj.ground = this.ground;
      obj.normalPrice = this.normalPrice;
      obj.promotionPrice = this.promotionPrice;
      return obj;
    }
  }
};
