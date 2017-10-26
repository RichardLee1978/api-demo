/**
 * GroundPlan.js
 *
 * @description :: 场地占用计划表，每天清理过期数据
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
    // 运动馆
    venue: {
      model: 'venue'
    },
    // 项目
    event: {
      model: 'event'
    },
    // 场地
    ground: {
      model: 'ground'
    },
    // 对应订单
    order: {
      model: 'sportsorder'
    },
    // 开始日期
    startDate: {
      type: 'integer'
    },
    // 开始时间
    startTime: {
      type: 'integer'
    },
    // 结束日期
    // 正常的下单情况下开始日期和结束日期应该是一样的
    // 出现不一致的情况只应该是在手动产生占用的情况
    endDate: {
      type: 'integer'
    },
    // 结束时间
    endTime: {
      type: 'integer'
    },
    // 描述
    description: {
      type: 'text'
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    }
  },

  beforeCreate: function(values, next) {
    async.auto({
      ground: function groundFn(callback) {
        Ground.findOne(values.ground).exec(callback);
      },
      event: [
        'ground',
        function eventFn(callback, result) {
          if (!result.ground) {
            return callback(null, null);
          }

          Event.findOne(result.ground.event).populate('venue').exec(callback);
        }
      ]
    }, function(err, results) {
      if (err) {
        return next(err);
      }
      if (!results.ground || !results.event) {
        return next(Utils.error(500));
      }

      values.event = results.event.id;
      values.venue = results.event.venue.id;
      return next();
    });
  }
};
