'use strict';

var moment = require('moment');

/**
 * 创建体育馆预订订单
 * @param {SportsOrder}   order    订单对象
 * @param {integer}       duration 时长/票数
 * @param {string}        ground   场地         与票务互斥
 * @param {string}        ticket   票务         与场地互斥
 * @param {Function}      cb       回调函数
 * @return {orderId, createdAt,timeLimit} 订单Id，创建时间，订单过期时长
 */
exports.createSportsOrder = function(order, duration, ground, ticket, rememberContact, cb) {
  var startDate = moment(order.startTime, 'YYYYMMDDHHmm');
  var endDate = startDate.clone();
  var isGround = ground ? true : false;

  order.startTime = startDate.toDate();
  if (ground) {
    order.endTime = endDate.add(duration, 'h').toDate();
  } else {
    order.endTime = '';
  }

  async.auto({
    check: function checkFn(callback) {
      Plan.check(order.type, ground || ticket, startDate, endDate,
        callback);
    },
    lock: [
      'check',
      function lockFn(callback) {
        if (isGround) {
          Plan.makeGroundPlanWithAPI(ground, startDate, endDate, callback);
        } else if (ticket) {
          Plan.makeTicketPlanWithAPI(ticket, startDate, duration, callback);
        }
      }
    ],
    order: [
      'lock',
      function orderFn(callback) {
        SportsOrder.create(order).exec(callback);
      }
    ],
    updatelock: [
      'order',
      function updatelockFn(callback, result) {
        if (isGround) {
          GroundPlan.update(result.lock.id, {
            order: result.order.id
          }).exec(callback);
        } else if (ticket) {
          TicketPlan.update(result.lock.id, {
            order: result.order.id
          }).exec(callback);
        }
      }
    ],
    updateContact: [
      'order',
      function updateContactFn(callback, result) {
        if (!rememberContact) {
          return callback(null, null);
        }
        UserExtra.update(result.order.user, {
          lastContact: {
            name: result.order.name,
            phone: result.order.phone
          }
        }).exec(callback);
      }
    ],
    methods: [
      'order',
      function methods(callback, result) {
        OrderTaskV1.begin('sportsorder', result.order, callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, {
      orderId: results.order.id,
      createdAt: results.order.createdAt,
      timeLimit: Constant.sportsOrderTimeLimit,
      methods: results.methods
    });
  });
};

/**
 * 取消订单
 * @param   {user}      user      请求用户
 * @param   {string}    id        订单id
 * @param   {function}  callback  回调函数
 * @error   状态未定义
 * @error   订单不存在
 * @error   没有订单所有权
 */
exports.cancelSportsOrder = function(user, id, cb) {
  var status = 'cancel';
  async.auto({
    order: function orderFn(callback) {
      SportsOrder.findOne(id).exec(function(err, order) {
        if (err) {
          return callback(err);
        }
        if (!order) {
          return callback(Utils.error(400027));
        }
        if (order.orderStatus === status) {
          return callback(Utils.error(400030));
        }
        if (order.user !== user.id) {
          return callback(Utils.error(400012));
        }
        return callback(null, order);
      });
    },
    plan: [
      'order',
      function planFn(callback, result) {
        Plan.cancel(result.order, callback);
      }
    ],
    cancel: [
      'plan',
      function cancelFn(callback, result) {
        result.order.orderStatus = status;
        result.order.save(callback);
      }
    ]
  }, function(err) {
    if (err) {
      return cb(err);
    }
    return cb(null, null);
  });
};

/**
 * 当前用户的场地订单列表
 * @param {string}    userId   当前用户ID
 * @param {integer}   skip     跳过纪录数
 * @param {string}    sort     排序方式
 * @param {string}    type     订单类型
 * @param {Function}  cb       回调函数
 * @return {total,list}   总数，列表
 */
exports.sportsOrderList = function(userId, skip, sort, type, cb) {
  var filterObj = {
    user: userId
  };
  async.auto({
    status: function(callback) {
      var statusQuery = type && type !== 'all' ? {
        sportsOrderStatus: type
      } : {};
      OrderStatusDefine.find(statusQuery).exec(function(err, results) {
        if (err) {
          return callback(err);
        }

        filterObj.or = results.map(function(result) {
          var pair = result.id.split('-');
          return {
            orderStatus: pair[0],
            paidStatus: pair[1]
          };
        });

        return callback(null, null);
      });
    },
    total: ['status', function totalFn(callback) {
      SportsOrder.count(filterObj).exec(callback);
    }],
    fetch: [
      'total',
      function fetchFn(callback, result) {
        if (result.total === 0) {
          return callback(null, []);
        }
        SportsOrder.find({
          where: filterObj,
          skip: skip,
          limit: Constant.listLimit,
          sort: sort
        }).populate('venue')
        .populate('event')
        .populate('ground')
        .exec(callback);
      }
    ],
    methods: [
      'fetch',
      function methodsFn(callback, result) {
        var ids = _.pluck(result.fetch, 'id');
        OrderTaskV1.nextStepsWithOrders(ids, userId, callback);
      }
    ],
    list: [
      'fetch',
      'methods',
      function listFn(callback, result) {
        if (result.total === 0) {
          return callback(null, []);
        }
        async.map(result.fetch, function(order, mapcb) {
          order.methods = result.methods[order.id] || [];
          if (_.isEmpty(order.charges)) {
            return mapcb(null, order);
          }
          var ids = _.pluck(order.charges, 'id');
          GroundCharge.find(ids).exec(function(err, charges) {
            if (err) {
              return mapcb(err);
            }
            var temp = _.indexBy(charges, 'id');
            order.charges.forEach(function(obj) {
              obj.charge = temp[obj.id];
              delete obj.id;
            });
            return mapcb(null, order);
          });
        }, function(err, results) {
          if (err) {
            return callback(err);
          }
          return callback(null, results);
        });
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    delete results.fetch;
    delete results.methods;
    return cb(null, results);
  });
};

/**
 * 订单详情
 * @param {string}   id       订单号
 * @param {date}   lastdate 最后更新时间
 * @param {Function} callback 回调函数
 * @return boolean|order  如无更新返回false，有更新返回全部信息
 */
exports.sportsOrderDetail = function(id, userId, lastdate, cb) {
  var whereObj = {
    id: id
  };
  if (lastdate) {
    whereObj.updatedAt = {
      '>': lastdate
    };
  }

  async.auto({
    order: function orderFn(callback) {
      SportsOrder.findOne(whereObj)
        .populate('venue')
        .populate('event')
        .populate('ground').exec(function(err, detail) {
          if (err) {
            return callback(err);
          }

          if (!detail) {
            return callback(null, false);
          }

          return callback(null, detail);
        });
    },
    methods: function methodsFn(callback) {
      OrderTaskV1.nextSteps(id, userId, callback);
    }
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    var order = results.order;
    order.methods = results.methods;
    return cb(null, order);
  });
};
