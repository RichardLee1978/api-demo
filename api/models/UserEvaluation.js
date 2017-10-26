/**
 * UserEvaluation.js
 *
 * @description :: 用户评价记录表
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
'use strict';

module.exports = {
  schema: true,

  attributes: {
    id: {
      type: 'string',
      primaryKey: true
    },
    // 用户
    user: {
      model: 'user'
    },
    // 教练订单
    coachOrder: {
      model: 'coachorder'
    },
    // 教练课程
    coachCourse: {
      model: 'coachcourse'
    },
    // 场馆
    venue: {
      model: 'venue'
    },
    // 活动
    activity: {
      // model: 'activity' 暂时没有活动类所以先占位
      type: 'string',
      defaultsTo: ''
    },
    // 评分
    rating: {
      type: 'float',
      defaultsTo: 0.0
    },
    // 评价内容
    content: {
      type: 'string',
      defaultsTo: ''
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    }
  },

  afterCreate: function(record, next) {
    next();
  },
  afterUpdate: function(record, next) {
    next();
  },

  getByOrderId: function(type, userId, objectId, next) {
    var filterObj = {
      user: userId,
      enabled: true
    };
    filterObj[type] = objectId;

    UserEvaluation.findOne(filterObj).exec(function(err, eObj) {
      if (err) {
        return next(err);
      }
      if (!eObj) {
        return next(null, {
          rating: 0,
          content: ''
        });
      }

      return next(null, {
        rating: eObj.rating,
        content: eObj.content
      });
    });
  }
};
