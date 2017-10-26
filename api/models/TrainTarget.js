/**
 * TrainTarget.js
 *
 * @description :: 训练项目目标类
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
'use strict';

function updateCache(values, next) {
  GlobalData.update('targets', values, next);
}

module.exports = {
  schema: true,
  autoPK: false,

  attributes: {
    id: {
      type: 'string',
      primaryKey: true
    },
    // 目标名称
    name: {
      type: 'json',
      defaultsTo: []
    },
    // 目标单位
    unit: {
      type: 'string',
      defaultsTo: ''
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.createdAt;
      delete obj.updatedAt;
      return obj;
    }
  },
  afterCreate: function(values, next) {
    updateCache(values, next);
  },
  afterUpdate: function(values, next) {
    updateCache(values, next);
  }
};
