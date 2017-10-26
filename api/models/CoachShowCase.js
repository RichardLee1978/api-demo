/**
 * CoachShowCase.js
 *
 * @description :: 教练展示台
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
    // 教练
    coach: {
      type: 'string',
      defaultsTo: ''
    },
    // 图片路径
    pic: {
      type: 'string',
      defaultsTo: ''
    },
    // 视频路径
    video: {
      type: 'string',
      defaultsTo: ''
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    // 排序序号
    index: {
      type: 'integer',
      defaultsTo: 0
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.createdAt;
      delete obj.updatedAt;
      return obj;
    }
  }
};
