/**
 * CustomLocation.js
 *
 * @description :: 自定义地点类
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
    // 用户
    user: {
      model: 'user'
    },
    // 经度
    longitude: 'float',
    // 纬度
    latitude: 'float',
    // 地点名
    name: {
      type: 'string',
      defaultsTo: ''
    },
    // 地址
    address: {
      type: 'string',
      defaultsTo: ''
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    // 是否公开
    public: {
      type: 'boolean',
      defaultsTo: true
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.createdAt;
      delete obj.updatedAt;
      delete obj.enabled;
      delete obj.public;
      return obj;
    }
  },
  beforeCreate: function(values, next) {
    if (values.latitude && values.longitude) {
      values.latitude = (+values.latitude).toFixed(6);
      values.longitude = (+values.longitude).toFixed(6);
    }

    next();
  },
  beforeUpdate: function(values, next) {
    if (values.latitude && values.longitude) {
      values.latitude = (+values.latitude).toFixed(6);
      values.longitude = (+values.longitude).toFixed(6);
    }

    next();
  }
};
