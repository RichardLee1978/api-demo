'use strict';

var moment = require('moment');

/**
 * 项目情况
 * @param {string}   id         项目id
 * @param {string}   day        查询日期
 * @param {string}   time       开始时间     备选
 * @param {string}   duration   时长        备选
 * @param {Function} cb         回调函数
 * @return {object}   待定
 */
exports.eventPlan = function(id, day, time, duration, cb) {
  async.auto({
    event: function getEvent(callback) {
      Event.findOne(id).exec(function(err, result) {
        if (err) {
          return callback(err);
        }
        if (!result) {
          return callback(Utils.error(400013));
        }
        return callback(null, result);
      });
    },
    charges: [
      'event',
      function getCharges(callback, result) {
        VenueCharge.find({
          where: {
            enabled: true,
            venue: result.event.venue,
            or: [{
              event: result.event.id
            }, {
              event: '*'
            }]
          }
        }).exec(callback);
      }
    ],
    grounds: [
      'event',
      function getGrounds(callback, result) {
        if (result.event.planType === 'ticket') {
          return callback(null, null);
        }

        var startDate = moment(day + time, 'YYYYMMDDHHmm');
        var endDate = startDate.clone().add(duration, 'h');

        Plan.listGround(id, startDate, endDate, function(err, grounds) {
          if (err) {
            return callback(err);
          }
          return callback(null, grounds);
        });
      }
    ],
    tickets: [
      'event',
      function getTickets(callback, result) {
        if (result.event.planType === 'ground') {
          return callback(null, null);
        }

        Ticket.find({
          where: {
            event: result.event.id,
            enabled: true,
            date: day,
            remain: {
              '>=': duration
            }
          },
          sort: 'time'
        }).exec(callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    var rObj = {
      charges: results.charges
    };
    if (results.event.planType === 'ground') {
      rObj.grounds = results.grounds;
    } else if (results.event.planType === 'ticket') {
      rObj.tickets = results.tickets;
    }
    return cb(null, rObj);
  });
};
