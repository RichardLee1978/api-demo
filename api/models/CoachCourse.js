/**
 * CoachCourse.js
 *
 * @description :: 教练课程信息
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
    // 课程编号
    shortId: {
      type: 'string',
      defaultsTo: ''
    },
    // 教练
    coach: {
      model: 'user'
    },
    // 课程名称
    title: {
      type: 'string',
      defaultsTo: ''
    },
    // 课程项目类型
    category: {
      type: 'string',
      defaultsTo: ''
    },
    // 课程配图
    picture: {
      type: 'string',
      defaultsTo: ''
    },
    // 地点
    location: {
      model: 'customlocation'
    },
    // 场馆
    venue: {
      model: 'venue'
    },
    // 可报名人数
    maxTrainee: {
      type: 'integer',
      defaultsTo: 0
    },
    // 最少开课人数
    minTrainee: {
      type: 'integer',
      defaultsTo: 0
    },
    // 当前人数
    currentTrainee: {
      type: 'integer',
      defaultsTo: 0
    },
    // 价格
    price: {
      type: 'float',
      defaultsTo: 0.0
    },
    // 课程内容
    content: {
      type: 'string',
      defaultsTo: ''
    },
    // 课程说明
    description: {
      type: 'text',
      defaultsTo: ''
    },
    // 课程节数
    totalChapter: {
      type: 'integer',
      defaultsTo: 0
    },
    // 当前进度
    currentChapter: {
      type: 'string',
      defaultsTo: ''
    },
    // 是否完成
    finish: {
      type: 'boolean',
      defaultsTo: false
    },
    // 课程状态
    // 待开课、未完成、待确认、已完成、已取消
    // 待开课可报名、已开课可报名、报名截止
    status: {
      type: 'string',
      defaultsTo: 'wait'
    },
    // 课程评分
    score: {
      type: 'float',
      defaultsTo: 0.0
    },
    // 是否自动开课
    // 达到最少开课人数
    autoBegin: {
      type: 'boolean',
      defaultsTo: false
    },
    // 报名截止时间
    // 为第一节课开课前多少小时or多少天
    closingDate: {
      type: 'integer',
      defaultsTo: 0
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },

    trainees: {
      collection: 'coachcoursetrainee',
      via: 'course'
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.createdAt;
      delete obj.updatedAt;
      return obj;
    }
  }
};
