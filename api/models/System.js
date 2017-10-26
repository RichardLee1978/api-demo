/**
 * System.js
 *
 * @description :: 系统信息类
 * @docs    :: http://sailsjs.org/#!documentation/models
 */
'use strict';

module.exports = {
  schema: true,

  attributes: {
    id: {
      type: 'string',
      primaryKey: true
    },
    // 系统设置键
    key: {
      type: 'string'
    },
    // 设备类别
    type: {
      type: 'string',
      defaultsTo: 'all'
    },
    version: {
      type: 'string',
      defaultsTo: 'all'
    },
    // 值
    value: {
      type: 'text'
    },
    // 描述
    description: {
      type: 'string'
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    }
  },
  afterCreate: function(values, next) {
    ObjectTime.update({
      type: 'info'
    }, {
      lastupdate: values.updatedAt
    }).exec(next);
  },
  afterUpdate: function(values, next) {
    ObjectTime.update({
      type: 'info'
    }, {
      lastupdate: values.updatedAt
    }).exec(next);
  }
};
