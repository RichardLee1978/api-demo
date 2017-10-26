'use strict';

var moment = require('moment');

exports.deployTicket = function(cb) {
  return cb(null, null);
  // async.auto({
  //   checkMonth: function checkMonthFn(callback) {
  //     Ticket.find({
  //       groupBy: 'event',
  //       where: {
  //         date: {
  //           'startsWith': moment().add(1, 'months').format('YYYYMM'),
  //         }
  //       }
  //     }).exec(callback);
  //   },
  // }, function (err, results) {
  //   return cb(err, results);
  // });
};

exports.getEaseMobToken = function() {
  EaseMob.getToken(function(err, token) {
    if (err) {
      sails.log.error(err);
    }
    sails.log.debug(token);
  });
};

exports.closeTimeoutOrder = function(cb) {
  async.auto({
    list: function listFn(callback) {
      OrderStatus.find({
        expireTime: {
          '<': moment().toDate()
        },
        orderStatus: 'to_be_accepted',
        paidStatus: 'to_pay'
      }).exec(function(err, list) {
        if (err) {
          return callback(err);
        }
        var ids = _.pluck(list, 'order');
        return callback(null, ids);
      });
    },
    processSportsOrder: [
      'list',
      function processSportsOrderFn(callback, result) {
        if (!_.isEmpty(result.list)) {
          SportsOrder.update(result.list, {
            orderStatus: 'cancelled',
            paidStatus: 'pay_cancelled'
          }).exec(callback);
        } else {
          return callback(null, []);
        }
      }
    ],
    processCoachOrder: [
      'list',
      function processCoachOrderFn(callback, result) {
        if (!_.isEmpty(result.list)) {
          CoachOrder.update(result.list, {
            orderStatus: 'cancelled',
            paidStatus: 'pay_cancelled'
          }).exec(callback);
        } else {
          return callback(null, []);
        }
      }
    ],
    processInCache: [
      'processSportsOrder',
      'processCoachOrder',
      function processInCacheFn(callback, result) {
        if (!_.isEmpty(result.list)) {
          OrderStatus.destroy({
            order: result.list
          }).exec(callback);
        } else {
          return callback(null, null);
        }
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, {
      sports: results.processSportsOrder.length,
      coach: results.processCoachOrder.length
    });
  });
};
