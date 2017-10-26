/**
* OrderWorkflow.js
*
* @description :: 订单工作流定义类
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
    // 对象类型
    type: {
      type: 'string',
      defaultsTo: ''
    },
    // 描述
    description: {
      type: 'string',
      defaultsTo: ''
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    // 所有者
    owner: {
      type: 'string',
      defaultsTo: ''
    },
    // 承揽人
    contractor: {
      type: 'string',
      defaultsTo: ''
    },
    // 版本
    version: {
      type: 'string',
      defaultsTo: 'v1'
    },

    details: {
      collection: 'orderworkflowdetail',
      via: 'workflow'
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.createdAt;
      delete obj.updatedAt;
      return obj;
    }
  }
};
