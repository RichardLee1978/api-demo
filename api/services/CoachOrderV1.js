'use strict';

/**
 * 创建教练订单
 * @param  {string}   userId  当前用户ID
 * @param  {Object}   order   订单对象
 * @param  {Array}    details 订单详情集合
 */
exports.createCoachOrder = function(userId, order, details, cb) {
  async.auto({
    check: function checkFn(callback) {
      var checkObj = {
        coach: order.coach,
        enabled: true,
        or: []
      };
      _.each(details, function(obj) {
        checkObj.or.push({
          date: obj.date,
          beginTime: obj.from,
          endTime: obj.to
        });
      });
      CoachSchedule.find(checkObj).exec(function(err, results) {
        if (err) {
          return callback(err);
        }
        if (results && results.length) {
          return callback(Utils.error(400005));
        }
        return callback(null, true);
      });
    },
    checkCase: function checkCaseFn(callback) {
      TrainCase.count(order.trainCase).exec(function(err, count) {
        if (err) {
          return callback(err);
        }
        if (!count) {
          return callback(Utils.error(400037));
        }
        return callback(null, null);
      });
    },
    order: [
      'check',
      'checkCase',
      function orderFn(callback) {
        CoachOrder.create(order).exec(callback);
      }
    ],
    details: [
      'order',
      function detailsFn(callback, result) {
        _.each(details, function(dObj) {
          dObj.order = result.order.id;
        });
        CoachOrderDetail.create(details).exec(callback);
      }
    ],
    schedule: [
      'details',
      function scheduleFn(callback, result) {
        var newArr = [];
        _.each(details, function(dObj) {
          newArr.push({
            coach: result.order.coach,
            week: '',
            date: dObj.date,
            beginTime: dObj.from,
            endTime: dObj.to,
            order: result.order.id,
            enabled: true,
            busy: false
          });
        });
        CoachSchedule.create(newArr).exec(callback);
      }
    ],
    methods: [
      'order',
      function methods(callback, result) {
        OrderTaskV1.begin('coachorder', result.order, callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, {
      order: results.order.id,
      createdAt: results.order.createdAt,
      timeLimit: Constant.coachOrderTimeLimit,
      methods: results.methods
    });
  });
};

/**
 * 当前用户的教练订单列表
 * @param {string}    userId   当前用户ID
 * @param {integer}   skip     跳过纪录数
 * @param {string}    sort     排序方式
 * @param {string}    type     订单类型
 * @param {Function}  cb       回调函数
 * @return {total,list}   总数，列表
 */
exports.coachOrderList = function(userId, skip, sort, type, cb) {
  var filterObj = {
    user: userId
  };
  async.auto({
    status: function(callback) {
      var statusQuery = type && type !== 'all' ? {
        coachOrderStatus: type
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
      CoachOrder.count(filterObj).exec(callback);
    }],
    fetch: [
      'total',
      function fetchFn(callback, result) {
        if (result.total === 0) {
          return callback(null, []);
        }
        CoachOrder.find({
          where: filterObj,
          skip: skip,
          limit: Constant.listLimit,
          sort: sort
        }).populate('coach')
        .populate('location')
        .populate('venue')
        .populate('trainCase')
        .populate('detail')
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
          return mapcb(null, order);
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
 * @param {date}     lastdate 最后更新时间
 * @param {Function} callback 回调函数
 * @return boolean|order  如无更新返回false，有更新返回全部信息
 */
exports.coachOrderDetail = function(id, userId, lastdate, cb) {
  var filterObj = {
    id: id
  };
  if (lastdate) {
    filterObj.updatedAt = {
      '>': lastdate
    };
  }

  async.auto({
    order: function orderFn(callback) {
      CoachOrder.findOne(filterObj)
        .populate('coach')
        .populate('location')
        .populate('venue')
        .populate('trainCase')
        .populate('detail').exec(function(err, detail) {
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
    },
    evaluation: [
      'order',
      function evaluationFn(callback, result) {
        UserEvaluation.getByOrderId('coachOrder', result.order.user, id, callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    var order = results.order;
    order.methods = results.methods;
    order.evaluation = results.evaluation;
    return cb(null, order);
  });
};
