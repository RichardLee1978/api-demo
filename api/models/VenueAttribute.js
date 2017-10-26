/**
 * VenueAttribute.js
 *
 * @description :: 运动馆附加信息类
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
    // 运动馆
    venue: {
      model: 'venue'
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    // 信息名称
    key: {
      type: 'string',
      defaultsTo: ''
    },
    // 信息内容
    value: {
      type: 'string',
      defaultsTo: ''
    },
    // 描述
    description: {
      type: 'text',
      defaultsTo: ''
    }
  }
};
