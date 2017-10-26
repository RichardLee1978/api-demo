/**
 * CoachPrice.js
 *
 * @description :: 教练价格类
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
    // 单价
    price: {
      type: 'integer',
      defaultsTo: 0
    },
    // 多次数价格
    // [{frequency:...,price:...}]
    multi: {
      type: 'json',
      defaultsTo: []
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.createdAt;
      delete obj.updatedAt;
      delete obj.id;
      return obj;
    }
  }
};
