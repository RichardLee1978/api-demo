/**
 * CoachServiceTime.js
 *
 * @description :: 教练服务时间类
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
    // 星期
    week: {
      type: 'string',
      defaultsTo: '1234560'
    },
    // 时间段
    // [{from:0900,to:1200},...]
    timeScale: {
      type: 'json',
      defaultsTo: []
    },
    // 最长预订期限
    preOrderDuration: {
      type: 'integer',
      defaultsTo: 1
    },
    // 课时长度
    periodDuration: {
      type: 'integer',
      defaultsTo: 1
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.createdAt;
      delete obj.updatedAt;
      delete obj.id;
      obj.timeScale = _.map(obj.timeScale, function(_obj) {
        _obj.from = _obj.from < 1000 ? `0${+_obj.from}` : `${_obj.from}`;
        _obj.to = _obj.to < 1000 ? `0${+_obj.to}` : `${_obj.to}`;
        return _obj;
      });
      return obj;
    }
  },
  beforeCreate: function(values, next) {
    if (!_.isEmpty(values.timeScale)) {
      values.timeScale = _.map(values.timeScale, function(obj) {
        obj.from = obj.from < 1000 ? `0${+obj.from}` : `${obj.from}`;
        obj.to = obj.to < 1000 ? `0${+obj.to}` : `${obj.to}`;
        return obj;
      });
    }
    return next();
  },
  beforeUpdate: function(values, next) {
    if (!_.isEmpty(values.timeScale)) {
      values.timeScale = _.map(values.timeScale, function(obj) {
        obj.from = obj.from < 1000 ? `0${+obj.from}` : `${obj.from}`;
        obj.to = obj.to < 1000 ? `0${+obj.to}` : `${obj.to}`;
        return obj;
      });
    }
    return next();
  }
};
