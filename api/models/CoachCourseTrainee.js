/**
 * CoachCourseTrainee.js
 *
 * @description :: 教练课程学员信息类
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
      model: 'user'
    },
    // 课程
    course: {
      model: 'coachcourse'
    },
    // 学员
    trainee: {
      model: 'user'
    },
    // 已完成课程章节
    finishChapter: {
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
  }
};
