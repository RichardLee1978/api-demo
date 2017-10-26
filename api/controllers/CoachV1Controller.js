/**
 * CoachV1Controller
 *
 * @description :: 教练端 API V1 版
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict';

module.exports = {
  /**
   * 获取教练日程列表
   * @URL   get r|^/v1/coach(/?)(\\w*)/schedule$|,id
   */
  scheduleList: function(req, res) {
    var moment = require('moment'),
      user = req.user,
      id = req.param('id'),
      startDate = req.param('startDate') || moment().format('YYYYMMDD'),
      days = req.param('days') || (7 * 4),
      self = false;

    if (!id) {
      id = user.id;
      self = true;
    }

    var lastupdate = req.param('lastupdate') || 0;
    var lastdate = lastupdate ? moment.unix(lastupdate).toDate() : null;

    CoachV1.scheduleList(id, self, startDate, days, lastdate, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },

  /**
   * 获取教练信息
   * @URL get r|^/v1/coach(/?)(\\w*)$|,id
   */
  coachInfo: function(req, res, next) {
    var id = req.param('id'),
      user = req.user,
      userId = user && user.id,
      self = false;

    if (!id) {
      id = user.id;
      self = true;
    }
    if (id === userId) {
      self = true;
    }
    if (id.length !== 24) {
      return next();
    }

    CoachV1.coachInfo(id, self, userId || '', function(err, coachInfo) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(coachInfo);
    });
  },

  /**
   * 更新教练信息
   * @URL put r|^/v1/coach(/?)(\\w*)$|,id
   */
  modifyCoachInfo: function(req, res, next) {
    var price = req.param('price'),
      password = req.param('password'),
      avatar = req.param('avatar'),
      nickname = req.param('nickname'),
      regions = req.param('regions'),
      coach = req.user,
      coachId = coach.id,
      coachName = coach && coach.username;

    if (coachId.length !== 24) {
      return next();
    }

    async.auto({
      userinfo: function userinfoFn(callback) {
        var userExtra = {};
        var userInfo = {};
        if (avatar) {
          userInfo.avatar = avatar;
        }
        if (nickname) {
          userInfo.nickname = nickname;
        }
        UserV1.updateUserInfo(coachId, userInfo, userExtra, null, callback);
      },
      password: function passwordFn(callback) {
        if (!coachName || !password) {
          return callback(null);
        }
        UserV1.changePassword(coachName, password, callback);
      },
      price: function priceFn(callback) {
        if (!price) {
          return callback(null);
        }
        CoachV1.modifyCoachPrice(coachId, {
          price: price
        }, callback);
      },
      regions: function regionFn(callback) {
        if (!regions) {
          callback(null);
        }
        CoachV1.updateCoachInfo(coachId, {
          regions: regions
        }, callback);
      }
    }, function(err) {
      if (err) {
        return res.returnError(err);
      }
      res.data({
        message: 'success'
      });
    });

  },

  /**
   * 获取教练价格
   * @URL   get r|^/v1/coach(/?)(\\w*)/price$|,id
   */
  coachPrice: function(req, res) {
    var user = req.user,
      id = req.param('id');
    if (!id) {
      id = user.id;
    }

    CoachV1.coachPrice(id, function(err, coachPrice) {
      if (err) {
        return res.returnError(err);
      }

      if (!coachPrice) {
        return res.notFound();
      }

      return res.data(coachPrice);
    });
  },

  /**
   * 更新教练价格
   * @URL   put r|^/v1/coach(/?)(\\w*)/price$|,id
   */
  modifyCoachPrice: function(req, res) {
    var user = req.user,
      id = req.param('id'),
      price = req.param('price'),
      multi = req.param('multi');

    if (!id) {
      id = user.id;
    }

    if (!price) {
      return res.badRequest(400001);
    }

    CoachV1.modifyCoachPrice(id, {
      price: price,
      multi: multi
    }, function(err, newPrice) {
      if (err) {
        return res.returnError(err);
      }

      res.data(newPrice);
    });

  },

  /**
   * 获取教练订单
   * @URL   get r|^/v1/coach(/?)(\\w*)/order$|,id
   */
  orderList: function(req, res) {
    var user = req.user,
      skip = req.param('skip') || 0,
      status = req.param('status') || '',
      id = req.param('id'),
      moment = require('moment');

    if (!id) {
      id = user.id;
    }

    var lastupdate = req.param('lastupdate') || 0;
    var lastdate = lastupdate ? moment.unix(lastupdate).toDate() : null;

    CoachV1.coachOrderList(id, status, skip, lastdate, function(err, orders) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(orders);
    });
  },

  /**
   * 获取订单详情
   * @URL get /coach/order/:id
   */
  orderDetail: function(req, res) {
    var id = req.param('id');
    var coachId = req.user && req.user.id;
    if (!id) {
      return res.badRequest(400001);
    }

    CoachV1.orderDetail(id, coachId, function(err, order) {
      if (err) {
        return res.returnError(err);
      }

      return res.data(order);
    });
  },

  /**
   * 更新订单详情
   * @URL put /coach/order/:id
   */
  modifyOrderDetail: function(req, res) {
    var user = req.user,
      coachId = user && user.id,
      step = req.param('step'),
      orderId = req.param('id');

    if (step) {
      step = +step;
    }

    var order = {
      // 训练项目
      trainCase: req.param('trainCase'),
      // 目标
      trainTarget: req.param('trainTarget'),
      // 实际
      trainActual: req.param('trainActual'),
      // 备注
      remark: req.param('remark'),
      // 理由
      reason: req.param('reason')

    };

    for (var key in order) {
      if (!order[key]) {
        delete order[key];
      }
    }

    async.auto({
      check: function checkFn(callback) {
        if (!step) {
          return callback(null, null);
        }
        OrderTaskV1.checkStepRequirementFields(step, order, callback);
      },
      modify: [
        'check',
        function modifyFn(callback) {
          if (!_.keys(order).length) {
            return callback(null, null);
          }

          CoachV1.modifyOrderDetail(orderId, coachId, order, callback);
        }
      ],
      process: [
        'modify',
        function processFn(callback) {
          if (!step) {
            return callback(null, null);
          }
          OrderTaskV1.process(coachId, orderId, step, callback);
        }
      ]
    }, function(err) {
      if (err) {
        return res.returnError(err);
      }
      return res.data({
        message: 'success'
      });
    });
  },

  /**
   * 获取教练可用时间
   * @URL   get r|^/v1/coach(/?)(\\w*)/serviceTime$|,id
   */
  serviceTime: function(req, res) {
    var user = req.user,
      id = req.param('id');

    if (!id) {
      id = user.id;
    }

    CoachV1.serviceTime(id, function(err, serviceTime) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(serviceTime);
    });
  },

  /**
   * 更新教练可用时间
   * @URL   put r|^/v1/coach(/?)(\\w*)/serviceTime$|,id
   */
  modifyServiceTime: function(req, res) {
    var user = req.user,
      id = req.param('id'),
      week = req.param('week'),
      timeScale = req.param('timeScale'),
      preOrderDuration = req.param('preOrderDuration');

    if (!id) {
      id = user.id;
    }

    week = _.uniq(week.split('')).join('');

    // {
    //   week: "1235",
    //   timeScale: [{from:"0900",to:"1200"}],
    //   preOrderDuration: 3
    // };

    function timeScaleFormatOk(_timeScale) {
      function formatOk(value) {
        var normalCheck = _.isString(value) && /^\d{4}$/.test(value);

        if (!normalCheck) {
          return false;
        }

        var hours = +value.slice(0, 2);
        var minutes = +value.slice(2);

        return hours > 0 && hours < 24 && (minutes === 0 || minutes === 30);
      }
      return formatOk(_timeScale.from) && formatOk(_timeScale.to);
    }

    function weekFormatOk(_week) {
      return /^[0-6]{1,7}/.test(_week);
    }

    // check required parameters
    if (!week || !timeScale || !preOrderDuration) {
      return res.badRequest(400001);
    }

    // check preOrderDuration format
    if (preOrderDuration > 4) {
      return res.badRequest(400044);
    }

    // check timeScale format
    if (!_.isArray(timeScale) || !timeScale.every(timeScaleFormatOk)) {
      return res.badRequest(400045);
    }

    // check week format
    if (!weekFormatOk(week)) {
      return res.badRequest(400046);
    }

    CoachV1.modifyServiceTime(id, week, timeScale, preOrderDuration, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      res.data(result);
    });
  },

  /**
   * 获取预订教练订单前置信息
   * @URL   get /v1/coach/:coachId/beforeOrder?date
   */
  beforeOrder: function(req, res) {
    var user = req.user,
      coachId = req.param('coachId'),
      date = req.param('date');

    CoachV1.beforeOrder(user.id, coachId, date, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },

  /**
   * 获取自定义地点
   * @URL   get /v1/coach/location
   */
  customLocationList: function(req, res) {
    var user = req.user;
    var userId = user.id;

    CustomLocationV1.customLocationList(userId, function(err, list) {
      if (err) {
        return res.returnError(err);
      }
      res.data(list);
    });
  },
  /**
   * 创建自定义地点
   * @URL   post /v1/coach/location
   */
  createCustomLocation: function(req, res) {
    var user = req.user,
      userId = user.id;

    CustomLocationV1.createCustomLocation(userId, {
      longitude: req.param('longitude'),
      latitude: req.param('latitude'),
      name: req.param('name'),
      address: req.param('address'),
      public: false
    }, function(err, customlocation) {
      if (err) {
        return res.returnError(err);
      }
      res.data(customlocation);
    });
  },
  /**
   * 更新自定义地点
   * @URL   put /v1/coach/location/:id
   */
  updateCustomLocation: function(req, res) {
    var user = req.user,
      userId = user.id,
      id = req.param('id');

    CustomLocationV1.updateCustomLocation(id, userId, {
      longitude: req.param('longitude'),
      latitude: req.param('latitude'),
      name: req.param('name'),
      address: req.param('address'),
      public: false
    }, function(err, customlocation) {
      if (err) {
        return res.returnError(err);
      }
      res.data(customlocation);
    });
  },
  /**
   * 删除自定义地点
   * @URL   delete /v1/coach/location/:id
   */
  removeCustomLocation: function(req, res) {
    var user = req.user,
      id = req.param('id');

    CustomLocationV1.removeCustomLocation(id, user.id, function(err) {
      if (err) {
        return res.returnError(err);
      }
      return res.data({
        message: 'success'
      });
    });
  }
};
