/**
 * Ground.js
 *
 * @description :: 场地类
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
    // 排序
    displayOrder: {
      type: 'integer',
      defaultsTo: 1
    },
    // 名称
    name: {
      type: 'string',
      defaultsTo: ''
    },
    // 容纳人数
    volume: {
      type: 'string',
      defaultsTo: ''
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    // 描述
    description: {
      type: 'text',
      defaultsTo: ''
    },

    charges: {
      collection: 'groundcharge',
      via: 'ground'
    },
    plan: {
      collection: 'groundplan',
      via: 'ground'
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.createdAt;
      delete obj.updatedAt;
      delete obj.enabled;
      return obj;
    }
  }
};
