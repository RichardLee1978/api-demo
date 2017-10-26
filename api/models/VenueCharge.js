/**
 * VenueCharge.js
 *
 * @description :: 运动馆附加费类
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
    // 费用名目
    name: 'string',
    // 费用类型
    type: 'string',
    // 所属运动馆
    venue: {
      model: 'venue'
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
    // 附加单位 人/场地
    target: {
      type: 'string',
      defaultsTo: 'ground'
    },
    // 是否可以买多个
    isMulti: {
      type: 'boolean',
      defaultsTo: false
    },
    // 正常金额
    normalPrice: 'float',
    // 优惠金额
    promotionPrice: 'float',
    // 描述
    description: {
      type: 'text',
      defaultsTo: ''
    }
  }
};
