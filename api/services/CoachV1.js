'use strict';

var moment = require('moment');

/**
 * 获取教练信息
 * @param {string}    id        教练id
 * @param {boolean}   self      是否当前用户请求
 * @param {string}    userId    当前用户id
 * @param {function}  callback  回调函数
 */
exports.coachInfo = function(id, self, userId, cb) {
  var needPhone = !self;
  async.auto({
    coach: function coachFn(callback) {
      User.withId(self, id, null, ['info', 'extra', 'coachInfo'], needPhone,
        function(err, result) {
          if (err) {
            return callback(err);
          }
          if (!result.verifyCoach) {
            return callback(Utils.error(400007));
          }
          if (_.has(result, 'coachInfo')) {
            delete result.coachInfo.idCardType;
            delete result.coachInfo.idNumber;
          }
          return callback(null, result);
        });
    },
    relation: [
      'coach',
      function relationFn(callback) {
        if (self) {
          return callback(null, null);
        }

        UserRelation.checkRelation(userId, id, callback);
      }
    ],
    cases: [
      'coach',
      function casesFn(callback, result) {
        var caseIds = result.coach.coachInfo.cases;
        TrainCase.find({
          id: caseIds,
          or: [{
            coach: null
          }, {
            coach: id
          }],
          enabled: true
        }).exec(function(err, cases) {
          if (err) {
            return callback(err);
          }
          var returnCases = {};
          _.each(cases, function(cobj) {
            if (!returnCases[cobj.id]) {
              returnCases[cobj.id] = cobj.toJSON();
            } else {
              if (!_.isEmpty(cobj.coach)) {
                returnCases[cobj.id] = cobj.toJSON();
              }
            }
          });
          return callback(null, _.values(returnCases));
        });
      }
    ],
    price: [
      'coach',
      function priceFn(callback) {
        CoachPrice.findOne(id).exec(function(err, price) {
          if (err) {
            return callback(err);
          }
          return callback(null, price);
        });
      }
    ],
    favorites: [
      'coach',
      function favoritesFn(callback) {
        UserFavorite.userInFavorite(id, function(err, count) {
          if (err) {
            return callback(err);
          }
          return callback(null, count);
        });
      }
    ],
    evaluation: [
      'coach',
      function evaluationFn(callback) {
        // TODO: 加入评价总数
        return callback(null, 0);
      }
    ],
    serviceTime: [
      'coach',
      function serviceTimeFn(callback) {
        return CoachServiceTime.findOne(id).exec(callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    var returnObj = {
      coach: results.coach
    };
    returnObj.coach.coachInfo.cases = results.cases;
    returnObj.coach.price = results.price.toJSON();
    returnObj.favorites = results.favorites;
    returnObj.evaluation = results.evaluation;
    returnObj.serviceTime = results.serviceTime;

    if (results.relation) {
      returnObj.relation = results.relation;
    }
    if (needPhone) {
      var phone = returnObj.coach.username;
      delete returnObj.coach.username;
      phone = Utils.encrypt(phone, `${userId}|${id}`);
      returnObj.phone = phone;
    }
    return cb(null, returnObj);
  });
};

/**
 * 认证教练
 * @param  id   教练ID
 */
exports.verify = function(id, verify, cb) {
  async.auto({
    verify: function verifyFn(callback) {
      User.update(id, {
        verifyCoach: verify
      }).exec(callback);
    },
    create: ['verify', function createFn(callback) {
      CoachInfo.findOne(id).exec(function(err, info) {
        if (err) {
          return callback(err);
        }
        if (info) {
          return callback(null);
        }

        CoachInfo.create({
          id: id
        }).exec(callback);
      });
    }]
  }, cb);
};

exports.updateCoachInfo = function(id, info, cb) {
  async.auto({
    update: function updateFn(callback) {
      if (!_.isEmpty(info)) {
        return CoachInfo.update(id, info).exec(callback);
      }
      return callback(null, null);
    }
  }, function(err) {
    if (err) {
      return cb(err);
    }

    return cb(null, {
      message: 'success'
    });
  });
};

/**
 * 获取教练价格
 * @param  {strong}   id    教练ID
 */
exports.coachPrice = function(id, cb) {
  CoachPrice.findOne(id).exec(cb);
};

/**
 * 更新修改教练价格
 * @param  {strong}   id    教练ID
 * @param  {json}     price 价格详细信息
 */
exports.modifyCoachPrice = function(id, priceObj, cb) {
  var multi = priceObj.multi;
  var price = +priceObj.price;

  if (!multi) {
    multi = [];
  }

  // [{
  //   frequency: Number,
  //   price: Number
  // }]
  function checkMulti(_multi) {
    if (!_.isArray(_multi)) {
      return false;
    }

    return _multi.every(function(item) {
      if (!_.isNumber(item.frequency) || !_.isNumber(item.price)) {
        return false;
      }
      if (item.frequency <= 0 || item.price <= 0) {
        return false;
      }
      return true;
    });
  }

  // validate priceEntity.price
  if (!_.isNumber(price) || _.isNaN(price)) {
    return cb(Utils.error(400047));
  }

  // validate multi
  if (!checkMulti(multi)) {
    return cb(Utils.error(400048));
  }

  async.auto({
    'check': function(done) {
      CoachPrice.findOne(id).exec(function(err, _price) {
        if (err) {
          return done(err);
        }
        return done(null, !!_price);
      });
    },
    'createOrUpdate': ['check', function(done, results) {
      var hasPrice = results.check;
      if (hasPrice) {
        CoachPrice.update(id, {
          price: price,
          multi: multi
        }).exec(done);
      } else {
        CoachPrice.create(_.extend({
          id: id
        }, {
          price: price,
          multi: multi
        })).exec(done);
      }
    }]
  }, function(err, results) {
    var pobj = results.createOrUpdate;
    if (err) {
      return cb(err);
    }

    return cb(null, pobj[0]);
  });
};

/**
 * 获取教练订单
 * @param  {string}   coachId       教练ID
 * @param  {string}   orderStatus   订单状态
 */
exports.coachOrderList = function(coachId, status, skip, lastdate, cb) {
  var whereObj = {
    coach: coachId
  };
  skip = skip || 0;

  if (lastdate) {
    whereObj.updatedAt = {
      '>': lastdate
    };
  }

  async.auto({
    status: function(callback) {
      var statusQuery = status && status !== 'all' ? {
        coachOrderStatus: status
      } : {};
      OrderStatusDefine.find(statusQuery).exec(function(err, results) {
        if (err) {
          return callback(err);
        }

        whereObj.or = results.map(function(result) {
          var pair = result.id.split('-');
          return {
            orderStatus: pair[0],
            paidStatus: pair[1]
          };
        });

        return callback(null, null);
      });
    },
    total: ['status', function(callback) {
      CoachOrder.count(whereObj).exec(callback);
    }],
    list: ['status', function(callback) {
      CoachOrder.find()
        .where(whereObj)
        .skip(skip)
        .populate('location')
        .populate('venue')
        .populate('trainCase')
        .limit(Constant.listLimit)
        .sort('updatedAt DESC')
        .exec(callback);
    }],
    methods: [
      'list',
      function methodsFn(callback, result) {
        var ids = _.pluck(result.list, 'id');
        OrderTaskV1.nextStepsWithOrders(ids, coachId, callback);
      }
    ],
    process: [
      'list',
      'methods',
      function processFn(callback, result) {
        var userids = _.uniq(_.pluck(result.list, 'user'));
        User.withIds(userids, null, ['info'], function(err, users) {
          if (err) {
            return callback(err);
          }
          async.map(result.list, function(order, mapCb) {
            order.user = users[order.user];
            var mobj = _.find(result.methods, {
              order: order.id
            });
            order.methods = mobj ? mobj.methods : [];

            mapCb(null, order);
          }, callback);
        });
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, {
      total: results.total,
      list: results.process
    });
  });
};

exports.orderDetail = function(id, coachId, cb) {
  async.auto({
    order: function orderFn(callback) {
      CoachOrder.findOne(id)
      .populate('location')
      .populate('venue')
      .populate('trainCase')
      .exec(function(err, order) {
        if (err) {
          return callback(err);
        }

        if (!order) {
          return callback(Utils.error(400027));
        }

        if (order.coach !== coachId) {
          return callback(Utils.error(400010));
        }
        return callback(null, order);
      });
    },
    user: [
      'order',
      function userFn(callback, result) {
        User.withId(false, result.order.user, null, ['info'], function(err, user) {
          if (err) {
            return callback(err);
          }
          return callback(null, user);
        });
      }
    ],
    methods: [
      'order',
      function methodsFn(callback) {
        OrderTaskV1.nextSteps(id, coachId, callback);
      }
    ],
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
    var returnObj = {};
    var user = results.user;
    returnObj.order = results.order;
    returnObj.order.methods = results.methods;
    returnObj.order.evaluation = results.evaluation;
    returnObj.order.user = user;
    return cb(null, returnObj);
  });
};

/**
 * 更新订单信息
 * @param  {string}   id      订单ID
 * @param  {string}   coachId 教练ID
 * @param  {[type]}   order   订单详情
 */
exports.modifyOrderDetail = function(id, coachId, order, cb) {
  function validateTrainTarget(targets) {
    if (!targets) {
      return true;
    }
    return targets.every(function(target) {
      var result = target.id && target.value !== '';
      result = result && _.isNumber(+target.value) && target.id.length === 24;
      return result;
    });
  }

  if (!validateTrainTarget(order.trainTarget)) {
    return cb(Utils.error(400022));
  }

  if (!validateTrainTarget(order.trainActual)) {
    return cb(Utils.error(400021));
  }

  async.waterfall([
    function checkOrder(done) {
      CoachOrder.findOne(id).exec(function(err, result) {
        if (err) {
          return done(err);
        }
        return done(null, result);
      });
    },
    function updateOrder(originOrder, done) {
      // 订单必须存在
      if (!originOrder) {
        return done(Utils.error(400027));
      }

      // 必须为当前教练订单
      if (originOrder.coach !== coachId) {
        return done(Utils.error(400010));
      }

      // 已确认订单不可变更
      if (_.contains(['confirmed', 'canceled', 'declined'], originOrder.orderStatus)) {
        return done(Utils.error(400026));
      }

      return CoachOrder.update(id, order).exec(done);
    }
  ], function(err, results) {
    if (err) {
      return cb(err);
    }

    cb(null, results);
  });
};

/**
 * 教练日程列表
 * @param  {string}     userId        教练ID
 * @param  {boolean}    self          是否自己查看
 * @param  {string}     startDate     起始日期 (20150121)
 * @param  {integer}    days          查询多少天
 * @param  {date}       lastdate      最后更新时间
 */
exports.scheduleList = function(userId, self, startDate, days, lastdate, cb) {
  var query = {
    coach: userId
  };
  var endDate;
  moment.locale('zh-cn');

  var year = +startDate.slice(0, 4);
  var month = +startDate.slice(4, 6);
  var date = +startDate.slice(6, 8);

  startDate = moment().year(year).month(month - 1).date(date);
  endDate = moment(startDate).add(days - 1, 'days');

  query.date = {
    '>=': +startDate.format('YYYYMMDD'),
    '<=': +endDate.format('YYYYMMDD')
  };

  if (lastdate) {
    query.updatedAt = {
      '>': lastdate
    };
  }

  async.auto({
    schedules: function schedulesFn(callback) {
      CoachSchedule
        .find(query)
        .populate('course')
        .populate('coach')
        .populate('order')
        .exec(callback);
    },
    process: [
      'schedules',
      function processFn(callback, result) {
        async.map(result.schedules, function(schedule, done) {
          function endUp(_err, obj) {
            if (_err) {
              return done(_err);
            }
            var returnObj = _.extend({
              beginTime: schedule.beginTime,
              endTime: schedule.endTime,
              date: `${schedule.date}`,
              id: schedule.id
            }, obj);
            return done(null, returnObj);
          }

          if (schedule.busy === true && !schedule.course) {
            return endUp(null, {
              type: 'busy',
              busyReason: schedule.busyReason
            });
          }else {
            async.auto({
              course: function(innercb) {
                if (!schedule.course) {
                  return innercb(null, null);
                }
                CoachCourse.findOne(schedule.course.id)
                            .populate('venue')
                            .populate('trainees')
                            .exec(innercb);
              },
              order: function(innercb) {
                if (!schedule.order) {
                  return innercb(null, null);
                }
                CoachOrder.findOne(schedule.order.id)
                          .populate('location')
                          .populate('user')
                          .populate('venue')
                          .populate('trainCase')
                          .exec(innercb);
              },
              user: [
                'order',
                function userFn(innercb, results) {
                  var uid = results.order.user.id;
                  User.withId(false, uid, null, ['info'], true, function(err, user) {
                    if (err) {
                      return innercb(err);
                    }
                    return innercb(null, user);
                  });
                }
              ],
              type: [
                'course',
                'order',
                function typeFn(innercb) {
                  if (schedule.order) {
                    return innercb(null, 'order');
                  } else if (schedule.course) {
                    return innercb(null, 'course');
                  }
                }
              ]
            }, function(err, sobj) {
              if (err) {
                return endUp(err);
              }
              sobj.order.user = sobj.user;
              delete sobj.user;
              return endUp(null, sobj);
            });
          }
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
    return cb(null, results.process);
  });
};

/**
 * 获取教练服务时间
 * @param  {string}   userId 当前教练ID
 */
exports.serviceTime = function(userId, cb) {
  CoachServiceTime.findOne(userId).exec(function(err, result) {
    if (err) {
      return cb(err);
    }
    if (result) {
      return cb(null, result);
    } else {
      return cb(null, {
        message: 'current_coach_does_not_set_service_time'
      });
    }
  });
};

/**
 * 更新教练可用时间
 * @param  {string}     userId              教练ID
 * @param  {boolean}    week                是否自己查看
 * @param  {string}     timeScale           日历展现类型 week|month
 * @param  {integer}    preOrderDuration    年份
 */
exports.modifyServiceTime = function(userId, week, timeScale, preOrderDuration, cb) {
  async.auto({
    check: function checkFn(callback) {
      CoachServiceTime.findOne(userId).exec(function(err, serviceTime) {
        if (err) {
          return callback(err);
        }
        return callback(null, !!serviceTime);
      });
    },
    createOrUpdate: [
      'check',
      function createOrUpdateFn(callback, results) {
        var exists = results.check;
        if (exists) {
          CoachServiceTime.update(userId, {
            week: week,
            timeScale: timeScale,
            preOrderDuration: preOrderDuration
          }).exec(function(err, result) {
            if (err) {
              return callback(err);
            }
            return callback(null, result[0]);
          });
        } else {
          CoachServiceTime.create({
            id: userId,
            week: week,
            timeScale: timeScale,
            preOrderDuration: preOrderDuration
          }).exec(callback);
        }
      }
    ]
  }, function(err, results) {
    var result = results.createOrUpdate;
    if (err) {
      return cb(err);
    }
    return cb(null, result);
  });
};

/**
 * 获取预订教练订单前置信息
 * @param  {string}   userId  用户ID
 * @param  {string}   coachId 教练ID
 * @param  {string}   date    日期 YYYYMMDD
 */
exports.beforeOrder = function(userId, coachId, date, cb) {
  var startDate, endDate;
  var filterObj = {
    where: {
      coach: coachId
    },
    sort: {
      'date': 'ASC',
      'beginTime': 'ASC'
    }
  };
  if (!date) {
    date = moment().format('YYYYMMDD');
  }
  moment.locale('zh-cn');
  startDate = moment(date, 'YYYYMMDD');
  endDate = moment(date, 'YYYYMMDD').add(7, 'days');
  filterObj.where.date = {
    '>': +startDate.format('YYYYMMDD'),
    '<': +endDate.format('YYYYMMDD')
  };

  async.auto({
    busyTime: function busyTimeFn(callback) {
      CoachSchedule.find(filterObj).exec(function(err, results) {
        if (err) {
          return callback(err);
        }

        var returnObj = {};
        _.each(results, function(schedule) {
          if (!returnObj[schedule.date]) {
            returnObj[schedule.date] = [{
              from: schedule.beginTime,
              to: schedule.endTime
            }];
          } else {
            returnObj[schedule.date].push({
              from: schedule.beginTime,
              to: schedule.endTime
            });
          }
        });
        return callback(null, returnObj);
      });
    },
    coachLocation: function coachLocationFn(callback) {
      CustomLocation.find({
        enabled: true,
        user: coachId,
        public: false
      }).exec(callback);
    },
    userSportsOrders: function userSportsOrdersFn(callback) {
      SportsOrder.find({
        user: userId,
        startTime: {
          '>': startDate.toDate(),
          '<': endDate.toDate()
        },
        orderStatus: 'confirm',
        paidStatus: 'paid'
      }).populate('venue').exec(function(err, orders) {
        if (err) {
          return callback(err);
        }

        return callback(null, orders);
      });
    }
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results);
  });
};
