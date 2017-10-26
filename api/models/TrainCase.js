/**
 * TrainCase.js
 *
 * @description :: 训练项目类
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
'use strict';

function updateCache(values, next) {
  GlobalData.update('cases', values, next);
}

module.exports = {
  schema: true,
  autoPK: false,

  attributes: {
    id: {
      type: 'string',
      primaryKey: true
    },
    // 所属教练
    coach: {
      model: 'user'
    },
    // 所属运动类别
    category: {
      type: 'string',
      defaultsTo: '*'
    },
    // 项目名称
    name: {
      type: 'json',
      defaultsTo: []
    },
    // 项目预设目标
    target: {
      type: 'json',
      defaultsTo: []
    },
    // 最短训练时长
    minDuration: {
      type: 'integer',
      defaultsTo: 1
    },
    // 描述，当教练扩展训练项目修改时长的时候需要填写
    description: {
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
      delete obj.coach;
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
