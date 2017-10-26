/**
 * CoachCourseDetail.js
 *
 * @description :: 教练课程安排详情类
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
    // 课程
    course: {
      model: 'coachcourse'
    },
    // 序号
    index: {
      type: 'integer',
      defaultsTo: 0
    },
    // 日期
    date: {
      type: 'string',
      defaultsTo: ''
    },
    // 开始时间
    beginTime: {
      type: 'integer',
      defaultsTo: 0
    },
    // 结束时间
    endTime: {
      type: 'integer',
      defaultsTo: 0
    },
    // 是否完成
    finish: {
      type: 'boolean',
      defaultsTo: false
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
  }
};
