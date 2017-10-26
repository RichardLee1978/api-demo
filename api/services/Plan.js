'use strict';

/**
 * 检查是否可以被预订
 * @param   {string}            type        检查类型
 * @param   {string|integer}    id          对应ID
 * @param   {moment}            startDate   开始时间
 * @param   {moment}            endDate     结束时间
 * @param   {function}          callback    回调函数
 * @return  {boolean}           是否可以被预订
 */
function checkPlan(type, id, startDate, endDate, callback) {
  if (type === 'ground') {
    checkGroundPlan(id, startDate, endDate, callback);
  } else if (type === 'ticket') {
    checkTicketPlan(id, startDate, endDate, callback);
  }
}

/**
 * 检查场地是否可以被预订
 * @param   {integer}   groundId    场地ID
 * @param   {moment}    startDate   开始时间
 * @param   {moment}    endDate     结束时间
 * @param   {function}  callback    回调函数
 * @return  {boolean}   是否可以被预订
 */
function checkGroundPlan(groundId, startDate, endDate, callback) {
  var timeFilter = [{
    startTime: {
      '>=': +(startDate.format('HHmm')),
      '<=': +(endDate.format('HHmm'))
    }
  }, {
    endTime: {
      '>=': +(startDate.format('HHmm')),
      '<=': +(endDate.format('HHmm'))
    }
  }];
  GroundPlan.count({
    where: {
      enabled: true,
      ground: groundId,
      or: [{
        startDate: +(startDate.format('YYYYMMDD')),
        or: timeFilter
      }, {
        startDate: {
          '<=': +(startDate.format('YYYYMMDD'))
        },
        endDate: {
          '>=': +(startDate.format('YYYYMMDD'))
        },
        or: timeFilter
      }]
    }
  }).exec(function(err, count) {
    if (err) {
      return callback(err);
    }
    if (count > 0) {
      return callback(Utils.error(400015));
    }
    return callback(null, true);
  });
}

/**
 * 检查票务是否可以被预订
 * @param   {integer}   ticketId    票务ID
 * @param   {moment}    startDate   开始时间
 * @param   {integer}   quantity    预订张数
 * @param   {function}  callback    回调函数
 * @return  {boolean}   是否可以被预订
 */
function checkTicketPlan(ticketId, startDate, quantity, callback) {
  Ticket.findOne(ticketId).exec(function(err, ticket) {
    if (err) {
      return callback(err);
    }
    if (!ticket || ticket.remain < +quantity) {
      return callback(Utils.error(400025));
    }
    return callback(null, true);
  });
}

/**
 * 列出项目的可用场地及报价
 * @param   {string}    event       项目ID
 * @param   {moment}    startDate   开始时间
 * @param   {moment}    endDate     结束时间
 * @param   {function}  cb          回调函数
 * @return  {array}     场地报价数组
 */
function listGroundPlan(event, startDate, endDate, cb) {
  var timeFilter = [{
    beginTime: {
      '>=': +(startDate.format('HHmm')),
      '<=': +(endDate.format('HHmm'))
    },
    endTime: {
      '>=': +(startDate.format('HHmm')),
      '<=': +(endDate.format('HHmm'))
    }
  }, {
    beginTime: 0,
    endTime: 0
  }];

  async.auto({
    event: function eventFn(callback) {
      Event.findOne(event).exec(callback);
    },
    grounds: function groundsFn(callback) {
      Ground.find({
        where: {
          event: event,
          enabled: true
        },
        sort: 'displayOrder'
      }).exec(callback);
    },
    gids: [
      'grounds',
      function gidsFn(callback, result) {
        if (!result.grounds) {
          return callback(null, []);
        }

        var ids = _.pluck(result.grounds, 'id');

        GroundPlan.find({
          where: {
            enabled: true,
            ground: ids,
            startDate: +(startDate.format('YYYYMMDD')),
            or: [{
              startTime: {
                '>=': +(startDate.format('HHmm')),
                '<=': +(endDate.format('HHmm'))
              }
            }, {
              endTime: {
                '>=': +(startDate.format('HHmm')),
                '<=': +(endDate.format('HHmm'))
              }
            }]
          }
        }).exec(function(err, list) {
          if (err) {
            return callback(err);
          }

          var rejectids = _.pluck(list, 'ground');
          ids = _.difference(ids, rejectids);

          return callback(null, ids);
        });
      }
    ],
    charges: [
      'gids',
      function chargesFn(callback, result) {
        if (!result.gids) {
          return callback(null, []);
        }
        GroundCharge.find({
          where: {
            enabled: true,
            ground: result.gids,
            or: [{
              week: {
                'contains': startDate.day(),
                '!': '1234560'
              },
              or: timeFilter
            }, {
              date: {
                'contains': startDate.format('YYYYMMDD')
              },
              or: timeFilter
            }, {
              week: '1234560',
              date: '',
              or: timeFilter
            }]
          },
          sort: 'promotionPrice DESC'
        }).populate('ground').exec(callback);
      }
    ],
    process: [
      'charges',
      function processFn(callback, result) {
        if (!result.charges) {
          return callback(null, []);
        }

        var length = endDate.diff(startDate, 'hours', true);
        if (length <= result.event.planLength) {
          return callback(null, result.charges);
        }
        length = Math.round(length);

        async.map(result.charges, function(obj, mapcb) {
          obj.promotionPrice = obj.promotionPrice * length;
          obj.normalPrice = obj.normalPrice * length;

          mapcb(null, obj);
        }, function(err, results) {
          return callback(err, results);
        });
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.process);
  });
}

/**
 * 创建场地占用计划(API版)
 * @param   {integer}   groundId    场地ID
 * @param   {moment}    startDate   开始时间
 * @param   {moment}    endDate     结束时间
 * @param   {function}  callback    回调函数
 * @error   场地检查已被占用
 * @return  {integer}   占用计划ID，订单创建后用于关联订单
 */
function makeGroundPlanWithAPICreateSportsOrder(groundId, startDate,
  endDate, callback) {
  GroundPlan.create({
    ground: groundId,
    startDate: +(startDate.format('YYYYMMDD')),
    startTime: +(startDate.format('HHmm')),
    endDate: +(endDate.format('YYYYMMDD')),
    endTime: +(endDate.format('HHmm'))
  }).exec(function(err, result) {
    if (err) {
      return callback(err);
    }
    return callback(null, result.id);
  });
}

/**
 * 创建票务占用计划(API版)
 * @param   {string}    orderId     订单ID
 * @param   {integer}   ticketId    票务ID
 * @param   {moment}    startDate   开始时间
 * @param   {integer}   quantity    预订张数
 * @param   {function}  callback    回调函数
 * @error   余票不足
 * @return  {integer}   占用计划ID，订单创建后用于关联订单
 */
function makeTicketPlanWithAPICreateSportsOrder(orderId, ticketId, startDate,
  quantity, cb) {
  async.auto({
    begin: function beginFn(callback) {
      Ticket.query('BEGIN', callback);
    },
    lock: [
      'begin',
      function lockFn(callback) {
        Ticket.findOne(ticketId).exec(function(err, ticket) {
          if (err) {
            return callback(err);
          }
          ticket.remain = ticket.remain - quantity;
          ticket.save(callback);
        });
      }
    ],
    create: [
      'lock',
      function createFn(callback) {
        TicketPlan.create({
          order: orderId,
          ticket: ticketId,
          quantity: quantity
        }).exec(callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      Ticket.query('ROLLBACK', function() {
        return cb(err);
      });
    } else {
      Ticket.query('COMMIT', function() {
        return cb(null, results.create.id);
      });
    }
  });
}

/**
 * 用来清理一个月之前的占位数据
 * @param   {function}    callback    回调函数
 */
function clearGroundPlanWithSchedule(callback) {
  var moment = require('moment');
  GroundPlan.destroy({
    where: {
      endDate: {
        '<=': moment().subtract(2, 'M').endOf('month').format('YYYYMMDD')
      }
    }
  }).exec(function(err) {
    return callback(err);
  });
}

/**
 * 根据订单取消占用计划
 * @param   {SportsOrder}   order     订单对象
 * @param   {function}      callback  回调函数
 */
function cancelPlanWithOrderCancelOrExpire(order, cb) {
  if (order.type === 'ground') {
    GroundPlan.destroy({
      where: {
        order: order.id
      }
    }).exec(cb);
  } else if (order.type === 'ticket') {
    async.auto({
      plan: function planFn(callback) {
        TicketPlan.findOne({
          where: {
            order: order.id
          }
        }).exec(callback);
      },
      updateRemain: [
        'plan',
        function updateRemainFn(callback, result) {
          if (!result.plan) {
            return callback(null);
          }
          Ticket.findOne(result.plan.ticket).exec(function(err, ticket) {
            if (err) {
              return callback(err);
            }
            ticket.remain = ticket.remain + result.plan.quantity;
            ticket.save(callback);
          });
        }
      ],
      updatePlan: [
        'updateRemain',
        function updatePlanFn(callback, result) {
          if (!result.plan) {
            return callback(null);
          }
          TicketPlan.update({
            order: order.id
          }, {
            enabled: false
          }).exec(callback);
        }
      ]
    }, function(err) {
      if (err) {
        return cb(err);
      }
      return cb(null, null);
    });
  }
}

exports.check = checkPlan;
exports.listGround = listGroundPlan;
exports.makeGroundPlanWithAPI = makeGroundPlanWithAPICreateSportsOrder;
exports.makeTicketPlanWithAPI = makeTicketPlanWithAPICreateSportsOrder;
exports.cancel = cancelPlanWithOrderCancelOrExpire;
exports.clear = clearGroundPlanWithSchedule;
