/**
 * CoachSchedule.js
 *
 * @description :: 教练日程信息类
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
    // 星期
    week: {
      type: 'string',
      defaultsTo: '1234560'
    },
    // 日期
    date: {
      type: 'integer',
      defaultsTo: 0
    },
    // 开始时间
    beginTime: {
      type: 'string',
      defaultsTo: ''
    },
    // 结束时间
    endTime: {
      type: 'string',
      defaultsTo: ''
    },
    // 课程
    course: {
      model: 'coachcourse'
    },
    // 订单
    order: {
      model: 'coachorder'
    },
    // 是否占用
    busy: {
      type: 'boolean',
      defaultsTo: true
    },
    // 占用理由
    busyReason: {
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
  beforeCreate: function(values, next) {
    if (values.beginTime && +values.beginTime < 1000) {
      values.beginTime = `0${values.beginTime}`;
    }
    if (values.endTime && +values.endTime < 1000) {
      values.endTime = `0${values.endTime}`;
    }
    return next();
  },
  beforeUpdate: function(values, next) {
    if (values.beginTime && +values.beginTime < 1000) {
      values.beginTime = `0${values.beginTime}`;
    }
    if (values.endTime && +values.endTime < 1000) {
      values.endTime = `0${values.endTime}`;
    }
    return next();
  }
};
