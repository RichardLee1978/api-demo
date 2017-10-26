'use strict';

var moment = require('moment');

exports.info = function(client, cb) {
  var types = [
    'categories',
    'cities',
    'districts',
    'cases',
    'targets',
    'errorDescription'
  ];
  if (client.type.indexOf('user') === 0) {
    types.push('userStatus');
  } else if (client.type.indexOf('coach') === 0) {
    types.push('coachStatus');
  }

  async.auto({
    systemInfo: function systemInfoFn(callback) {
      InfoV1.systemInfo(client, callback);
    },
    caches: function cachesFn(callback) {
      ObjectCache.find({
        type: types
      }).exec(callback);
    }
  }, function(err, results) {
    var returnObj = {};
    _.each(results.caches, function(cacheObj) {
      returnObj[cacheObj.type] = {
        data: cacheObj.data,
        lastupdate: moment(cacheObj.updatedAt).unix()
      };
    });
    returnObj.systemInfo = results.systemInfo;
    return cb(null, returnObj);
  });
};

/**
 * 订单状态查询
 * @param {string}   id       订单id
 * @param {Function} callback 回调函数
 * @error 订单超时不存在
 * @return  过期秒数
 */
exports.orderTime = function(id, callback) {
  OrderStatus.findOneByOrder(id).exec(function(err, status) {
    if (err) {
      return callback(err);
    }

    if (!status) {
      return callback(Utils.error(400028));
    }
    var expire = moment(status.expireTime);
    if (moment().isBefore(expire)) {
      return callback(null, Math.ceil(expire.diff(moment()) / 1000));
    } else {
      return callback(Utils.error(400028));
    }
  });
};

/**
 * 获取系统信息
 * @param   {Client}    client    请求客户端
 * @param   {function}  callback  回调函数
 * @return  {object}    与客户端匹配的系统信息
 */
exports.systemInfo = function(client, callback) {
  var whereObj = {
    where: {
      type: ['all', client.type.toLowerCase()],
      version: ['all', client.version],
      enabled: true
    }
  };
  System.find(whereObj).exec(function(err, infos) {
    if (err) {
      return callback(err);
    }

    var last = 0;
    var returnObj = {};

    async.each(infos, function(item, cb) {
      var key = item.key;

      returnObj[key] = item.value;
      if ((moment(item.updatedAt).unix() || moment(item.createdAt).unix()) >
        last) {
        last = moment(item.updatedAt).unix() || moment(item.createdAt)
          .unix();
      }
      cb();
    }, function() {
      if (last > 0) {
        returnObj.lastupdate = last;
      }
      callback(null, returnObj);
    });
  });
};

/**
 * 分类列表
 * @param  {boolean}  all      是否获取其他分类
 */
exports.categories = function(all, next) {
  async.auto({
    cacheObj: function cacheObjFn(callback) {
      ObjectCache.findOneByType('categories').exec(callback);
    },
    process: [
      'cacheObj',
      function processFn(callback, result) {
        var categories = _.values(result.cacheObj.data);
        if (!all) {
          categories = _.filter(categories, function(obj) {
            return obj.enabled === true;
          });
        }
        categories = _.sortBy(categories, 'displayOrder');
        categories = _.map(categories, function(obj) {
          delete obj.displayOrder;
          return obj;
        });
        return callback(null, categories);
      }
    ]
  }, function(err, results) {
    if (err) {
      return next(err);
    }
    return next(null, results.process);
  });
};

/**
 * 城市列表
 */
exports.cities = function(next) {
  ObjectCache.findOneByType('cities').exec(function(err, cacheObj) {
    if (err) {
      return next(err);
    }
    return next(null, _.values(cacheObj.data));
  });
};

/**
 * 行政区列表
 */
exports.districts = function(city, skip, next) {
  async.auto({
    cacheObj: function cacheObjFn(callback) {
      ObjectCache.findOneByType('districts').exec(callback);
    },
    total: [
      'cacheObj',
      function totalFn(callback, result) {
        return callback(null, _.size(result.cacheObj.data));
      }
    ],
    process: [
      'total',
      function processFn(callback, result) {
        var districts = _.values(result.cacheObj.data);
        if (city !== 0) {
          districts = _.filter(districts, function(obj) {
            return +obj.city === +city;
          });
        }
        districts = _.sortBy(districts, 'displayOrder');
        districts = _.map(districts, function(obj) {
          delete obj.displayOrder;
          return obj;
        });
        if (result.total) {
          var end = +skip + Constant.listLimit * 5;
          districts = districts.slice(skip, end);
        }
        return callback(null, districts);
      }
    ]
  }, function(err, results) {
    if (err) {
      return next(err);
    }
    return next(null, {
      total: results.total,
      list: results.process
    });
  });
};

/**
 * 时间校对
 * @param   {boolean}   info    是否获取其他信息
 */
exports.time = function(info, callback) {
  var returnObj = {
    time: moment().unix()
  };
  if (!info) {
    return callback(null, returnObj);
  } else {
    ObjectTime.find().exec(function(err, list) {
      if (err) {
        return callback(err);
      }
      returnObj.last = {};
      _.each(list, function(obj) {
        returnObj.last[obj.type] = Math.ceil(obj.lastupdate.getTime() /
          1000);
      });
      return callback(null, returnObj);
    });
  }
};

/**
 * 获取训练项目
 * @param  {integer}   skip 跳过记录数
 */
exports.cases = function(skip, next) {
  async.auto({
    cacheObj: function cacheObjFn(callback) {
      ObjectCache.findOneByType('cases').exec(callback);
    },
    total: [
      'cacheObj',
      function totalFn(callback, result) {
        return callback(null, _.size(result.cacheObj.data));
      }
    ],
    process: [
      'total',
      function processFn(callback, result) {
        var cases = _.values(result.cacheObj.data);
        if (result.total) {
          var end = +skip + Constant.listLimit * 4;
          cases = cases.slice(skip, end);
        }
        return callback(null, cases);
      }
    ]
  }, function(err, results) {
    if (err) {
      return next(err);
    }
    return next(null, {
      total: results.total,
      list: results.process
    });
  });
};

/**
 * 获取运动目标
 */
exports.targets = function(next) {
  ObjectCache.findOneByType('targets').exec(function(err, cacheObj) {
    if (err) {
      return next(err);
    }
    return next(null, _.values(cacheObj.data));
  });
};

/**
 * 获取用户端订单状态定义信息
 */
exports.userStatus = function(next) {
  ObjectCache.findOneByType('userStatus').exec(function(err, cacheObj) {
    if (err) {
      return next(err);
    }
    return next(null, cacheObj.data);
  });
};

/**
 * 获取教练端订单状态定义信息
 */
exports.coachStatus = function(next) {
  ObjectCache.findOneByType('coachStatus').exec(function(err, cacheObj) {
    if (err) {
      return next(err);
    }
    return next(null, cacheObj.data);
  });
};

/**
 * 获取错误信息列表
 */
exports.errorDescription = function(next) {
  ObjectCache.findOneByType('errorDescription').exec(function(err, cacheObj) {
    if (err) {
      return next(err);
    }
    return next(null, cacheObj.data);
  });
};
