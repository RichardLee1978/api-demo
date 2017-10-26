'use strict';

var squel = require('squel').useFlavour('postgres');

exports.venueList = function(city, district, type, category, search, sort, page, cb) {
  if (search) {
    search = `%${search}%`;
  }

  var ids = [];

  var v = squel.select().from('venue');
  if (!_.isEmpty(search)) {
    v.where('name like ? or subname like ?', search, search);
  }
  if (+city !== 0) {
    v.where('city = ?', city);
  }
  var cnts = v.clone();

  var filterObj = {
    where: {},
    limit: Constant.listLimit,
    skip: (page - 1) * Constant.listLimit,
    sort: sort
  };

  async.auto({
    total: function totalFn(callback) {
      Venue.count().exec(callback);
    },
    filterByDistrict: function filterByDistrictFn(callback) {
      if (!district) {
        ObjectCache.findOneByType('districts').exec(function(err, cacheobj) {
          if (err) {
            return callback(err);
          }
          var districts = cacheobj.data;
          var tmp = [];
          _.forIn(districts, function(obj, key) {
            if (obj.city === +city) {
              tmp.push(+key);
            }
          });
          if (!_.isEmpty(tmp)) {
            cnts.where('district in ?', tmp);
          }
          return callback(null, null);
        });
      } else {
        cnts.where('district = ?', district);
        return callback(null, null);
      }
    },
    filterByCategory: function filterFn(callback) {
      if (!category) {
        return callback(null, null);
      }
      Event.find({
        category: category
      }).exec(function(err, result) {
        if (err) {
          return callback(err);
        }
        if (!_.isEmpty(result)) {
          var innerids = _.pluck(result, 'venue');
          cnts.where('id in ?', innerids);
        }
        return callback(null, null);
      });
    },
    filterTotal: [
      'filterByDistrict',
      'filterByCategory',
      function filterTotalFn(callback) {
        cnts.field('count(*)', 'cnt');
        cnts.field('string_agg("id", \',\')', 'ids');
        Venue.query(cnts.toString(), function(err, result) {
          if (err) {
            return callback(err);
          }
          result = result.rows.pop();
          if (+(result.cnt) > 0) {
            ids = result.ids.split(',');
            filterObj.where.id = ids;
          }
          return callback(null, +(result.cnt));
        });
      }
    ],
    list: [
      'filterTotal',
      function listFn(callback, result) {
        if (!result.filterTotal) {
          return callback(null, []);
        }
        Venue.find(filterObj).exec(callback);
      }
    ],
    totalPage: [
      'filterTotal',
      function totalPageFn(callback, result) {
        if (!result.filterTotal) {
          return callback(null, 0);
        }
        return callback(null, Math.ceil(result.filterTotal / Constant.listLimit));
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, {
      total: results.total,
      filterTotal: results.filterTotal,
      list: results.list,
      totalPage: results.totalPage,
      currentPage: page
    });
  });
};

exports.venueDetail = function(venueId, cb) {
  Venue.findOne(venueId)
    .populate('events')
    .populate('attriubtes')
    .populate('charges')
    .exec(function(err, detail) {
      if (err) {
        return cb(err);
      }
      if (!detail) {
        return cb(Utils.error('场馆不存在'));
      }
      return cb(null, detail);
    });
};

exports.createVenue = function(venueObj, cb) {
  async.auto({
    check: function checkFn(callback) {
      Venue.count({
        name: venueObj.name,
        subname: venueObj.subname,
        city: venueObj.city,
        latitude: venueObj.latitude,
        longitude: venueObj.longitude
      }).exec(function(err, count) {
        if (err) {
          return callback(err);
        }
        if (count) {
          return callback(Utils.error('场馆已存在'));
        }
        return callback(null, null);
      });
    },
    create: [
      'check',
      function createFn(callback) {
        Venue.create(venueObj).exec(callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.create);
  });
};

exports.updateVenue = function(venueId, venueObj, cb) {
  async.auto({
    check: function checkFn(callback) {
      Venue.count(venueId).exec(function(err, count) {
        if (err) {
          return callback(err);
        }
        if (!count) {
          return callback(Utils.error('场馆不存在'));
        }
        return callback();
      });
    },
    process: [
      'check',
      function processFn(callback) {
        Venue.update(venueId, venueObj).exec(callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.process.pop());
  });
};

exports.eventDetail = function(eventId, cb) {
  Event.findOne(eventId)
    .populate('grounds')
    .populate('charges')
    .exec(function(err, detail) {
      if (err) {
        return cb(err);
      }
      if (!detail) {
        return cb(Utils.error('项目不存在'));
      }
      return cb(null, detail);
    });
};

exports.createEvent = function(eventObj, cb) {
  async.auto({
    check: function checkFn(callback) {
      Event.count({
        venue: eventObj.venue,
        category: eventObj.category
      }).exec(function(err, count) {
        if (err) {
          return callback(err);
        }
        if (count) {
          return callback(Utils.error('场馆已存在'));
        }
        return callback(null, null);
      });
    },
    create: [
      'check',
      function createFn(callback) {
        Event.create(eventObj).exec(callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.create);
  });
};

exports.updateEvent = function(eventId, eventObj, cb) {
  async.auto({
    check: function checkFn(callback) {
      Event.count(eventId).exec(function(err, count) {
        if (err) {
          return callback(err);
        }
        if (!count) {
          return callback(Utils.error('项目不存在'));
        }
        return callback();
      });
    },
    process: [
      'check',
      function processFn(callback) {
        Event.update(eventId, eventObj).exec(callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.process.pop());
  });
};

exports.groundDetail = function(groundId, cb) {
  Ground.findOne(groundId)
    .populate('charges')
    .populate('plan')
    .exec(function(err, detail) {
      if (err) {
        return cb(err);
      }
      if (!detail) {
        return cb(Utils.error('场地不存在'));
      }
      return cb(null, detail);
    });
};

exports.createGround = function(groundObj, cb) {
  Ground.create(groundObj).exec(function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results);
  });
};

exports.updateGround = function(groundId, groundObj, cb) {
  async.auto({
    check: function checkFn(callback) {
      Ground.count(groundId).exec(function(err, count) {
        if (err) {
          return callback(err);
        }
        if (!count) {
          return callback(Utils.error('场地不存在'));
        }
        return callback();
      });
    },
    process: [
      'check',
      function processFn(callback) {
        Ground.update(groundId, groundObj).exec(callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.process.pop());
  });
};

exports.createGroundCharge = function(chargeObj, cb) {
  async.auto({
    check: function checkFn(callback) {
      GroundCharge.count({
        ground: chargeObj.ground,
        week: chargeObj.week,
        date: chargeObj.date,
        beginTime: chargeObj.beginTime,
        endTime: chargeObj.endTime
      }).exec(function(err, count) {
        if (err) {
          return callback(err);
        }
        if (count) {
          return callback(Utils.error('已经存在相同时段的场地价格设定'));
        }
        return callback(null, null);
      });
    },
    create: [
      'check',
      function createFn(callback) {
        GroundCharge.create(chargeObj).exec(callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.create);
  });
};

exports.updateVenueDisplayOrder = function(city, orderObj, cb) {
  async.auto({
    clean: function cleanFn(callback) {
      Venue.update({
        city: city
      }, {
        displayOrder: 100,
        recommend: false
      }).exec(callback);
    },
    process: [
      'clean',
      function processFn(callback) {
        var ids = _.pluck(orderObj, 'id');
        orderObj = _.indexBy(orderObj, 'id');
        Venue.find(ids).exec(function(err, venues) {
          if (err) {
            return callback(err);
          }
          async.each(venues, function(venue, eachcb) {
            venue.displayOrder = orderObj[venue.id].displayOrder;
            venue.recommend = true;
            venue.save(eachcb);
          }, callback);
        });
      }
    ]
  }, function(err) {
    if (err) {
      return cb(err);
    }
    return cb(null, {
      status: 'success'
    });
  });
};

exports.updateEventDisplayOrder = function(eventOrderObj, cb) {
  var ids = _.pluck(eventOrderObj, 'id');
  eventOrderObj = _.indexBy(eventOrderObj, 'id');

  Event.find(ids).exec(function(err, events) {
    if (err) {
      return cb(err);
    }

    async.each(events, function(event, eachcb) {
      event.displayOrder = eventOrderObj[event.id].displayOrder;
      event.save(eachcb);
    }, function(error) {
      if (error) {
        return cb(error);
      }
      return cb(null, {
        status: 'success'
      });
    });
  });
};

exports.updateGroundDisplayOrder = function(groundOrderObj, cb) {
  var ids = _.pluck(groundOrderObj, 'id');
  groundOrderObj = _.indexBy(groundOrderObj, 'id');

  Ground.find(ids).exec(function(err, grounds) {
    if (err) {
      return cb(err);
    }

    async.each(grounds, function(ground, eachcb) {
      ground.displayOrder = groundOrderObj[ground.id].displayOrder;
      ground.save(eachcb);
    }, function(error) {
      if (error) {
        return cb(error);
      }
      return cb(null, {
        status: 'success'
      });
    });
  });
};

exports.createContact = function(type, name, phone, city, district, address, cb) {
  BusinessContacts.create({
    type: type,
    name: name,
    phone: phone,
    city: city,
    district: district,
    address: address
  }).exec(function(err) {
    if (err) {
      return cb(err);
    }
    return cb(null, {
      status: 'success'
    });
  });
};

exports.contactList = function(type, city, isProcessed, page, cb) {
  var filterObj = {
    where: {
      type: type,
      city: city,
      process: isProcessed
    },
    limit: Constant.listLimit,
    skip: (page - 1) * Constant.listLimit,
    sort: 'createdAt DESC'
  };
  async.auto({
    total: function totalFn(callback) {
      BusinessContacts.count(callback);
    },
    filterTotal: function filterTotalFn(callback) {
      BusinessContacts.count(filterObj.where).exec(callback);
    },
    list: [
      'pre',
      function listFn(callback, result) {
        if (!result.filterTotal) {
          return callback(null, []);
        }
        BusinessContacts.find(filterObj).exec(callback);
      }
    ],
    totalPage: [
      'filterTotal',
      function totalPageFn(callback, result) {
        if (!result.filterTotal) {
          return callback(null, 0);
        }
        return callback(null, Math.ceil(result.filterTotal / Constant.listLimit));
      }
    ],
    currentPage: function currentPageFn(callback) {
      return callback(null, page);
    }
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results);
  });
};

exports.coachList = function(city, district, category, gender, search, sort, page, cb) {
  if (search) {
    search = `%${search}%`;
  }

  var ids = [];
  var v = squel.select({
    tableAliasQuoteCharacter: '"',
    nameQuoteCharacter: '"',
    autoQuoteTableNames: true
  });
  // TODO: 加入订单数排序
  v.from('user', 'u')
    .join('userinfo', 'ui', 'u.id = ui.id')
    .join('coachinfo', 'ci', 'u.id = ci.id')
    .where('u."verifyCoach" = true');

  if (gender !== 'all') {
    v.where('ui.gender = ?', gender);
  }
  if (!_.isEmpty(search)) {
    var searchstr = `ui.realname like ${search} or`;
    searchstr += `ui.nickname like ${search} or`;
    searchstr += `u.username like ${search} or`;
    searchstr += `ci.serialNumber like ${search} or`;
    searchstr += `ci.serialNumber like ${search}`;
    v.where(searchstr);
  }

  if (+city !== 0) {
    v.where('ui.city = ?', city);
  }
  if (category && category !== 'all') {
    v.where(`ci.category ?| array['${category}']`);
  }

  async.auto({
    total: function totalFn(callback) {
      User.count({
        verifyCoach: true
      }).exec(callback);
    },
    district: function districtFn(callback) {
      if (!district) {
        ObjectCache.findOneByType('districts').exec(function(err, cacheobj) {
          if (err) {
            return callback(err);
          }
          var districts = cacheobj.data;
          var tmp = [];
          _.forIn(districts, function(obj, key) {
            if (obj.city === +city) {
              tmp.push(`'${key}'`);
            }
          });
          district = tmp.join(',');
          v.where(`ci.regions ?| array[${district}]`);
          return callback(null, null);
        });
      } else {
        v.where(`ci.regions ?| array['${district}']`);
        return callback(null, null);
      }
    },
    filterTotal: [
      'district',
      function filterTotalFn(callback) {
        var cnts = v.clone();
        cnts.field('count(*)', 'cnt');
        cnts.field('string_agg(u."id", \',\')', 'ids');
        User.query(cnts.toString(), function(err, result) {
          if (err) {
            return callback(err);
          }
          result = result.rows.pop();
          if (+(result.cnt) > 0) {
            ids = result.ids.split(',');
            v.where('u."id" in ?', ids);
          }
          return callback(null, +(result.cnt));
        });
      }
    ],
    list: [
      'filterTotal',
      function listFn(callback, result) {
        if (!result.filterTotal) {
          return callback(null, []);
        }
        v.field('u.id')
          .field('u.username')
          .field('ui.nickname')
          .field('ui.realname')
          .field('ci.title')
          .field('ci."serialNumber"')
          .field('ui.gender')
          .field('ci.category')
          .field('ci.regions')
          .field('ci.recommend')
          .limit(Constant.listLimit)
          .offset((page - 1) * Constant.listLimit);

        switch (sort) {
          case 'displayOrder':
            v.order('ci.recommend', false);
            v.order('ci."displayOrder"');
            break;
          default:
            v.order('ci."createdAt"');
            break;
        }

        User.query(v.toString(), function(err, coachs) {
          if (err) {
            return callback(err);
          }
          return callback(null, coachs.rows);
        });
      }
    ],
    totalPage: [
      'filterTotal',
      function totalPageFn(callback, result) {
        if (!result.filterTotal) {
          return callback(null, 0);
        }
        return callback(null, Math.ceil(result.filterTotal / Constant.listLimit));
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, {
      total: results.total,
      filterTotal: results.filterTotal,
      list: results.list,
      totalPage: results.totalPage,
      currentPage: page
    });
  });
};

exports.coachDetail = function(id, cb) {
  User.withId(false, id, null, ['info', 'extra', 'coachInfo'], function(err, user) {
    if (err) {
      return cb(err);
    }
    return cb(null, user);
  });
};

exports.createVerifyCoach = function(username, userInfo, coachInfo, cb) {
  async.auto({
    user: function userFn(callback) {
      User.findOneByUsername(username).exec(function(err, user) {
        if (err) {
          return callback(err);
        }
        user.verifyCoach = true;
        user.coachInfo = user.id;
        user.save(function() {
          return callback(null, user);
        });
      });
    },
    userInfo: [
      'user',
      function userInfoFn(callback, result) {
        if (_.isEmpty(userInfo)) {
          return callback(null, null);
        }
        UserInfo.update(result.user.id, userInfo).exec(callback);
      }
    ],
    coachInfo: [
      'user',
      function coachInfoFn(callback, result) {
        if (!result.user) {
          return callback(null, null);
        }
        coachInfo.id = result.user.id;
        CoachInfo.create(coachInfo).exec(callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.coachInfo);
  });
};

exports.verifyCoachFromUser = function(userId, coachInfo, cb) {
  async.auto({
    user: function userFn(callback) {
      User.findOne(userId).exec(function(err, user) {
        if (err) {
          return callback(err);
        }
        if (user.verifyCoach) {
          return callback(Utils.error('当前用户已经是教练'));
        }
        user.verifyCoach = true;
        user.save(function() {
          return callback(null, user);
        });
      });
    },
    coachInfo: [
      'user',
      function coachInfoFn(callback, result) {
        if (!result.user) {
          return callback(null, null);
        }
        coachInfo.id = userId;
        CoachInfo.create(coachInfo).exec(callback);
      }
    ]
  }, function(err) {
    if (err) {
      return cb(err);
    }
    return cb(null, null);
  });
};

exports.updateCoachInfo = function(coachId, coachInfo, cb) {
  CoachInfo.update(coachId, coachInfo, cb);
};

exports.disableCoach = function(coachId, cb) {
  User.update(coachId, {
    verifyCoach: false
  }).exec(cb);
};

exports.sportsOrderList = function(venueId, status, page, sort, cb) {
  var filterObj = {
    where: {},
    limit: Constant.listLimit,
    skip: (page - 1) * Constant.listLimit,
    sort: sort
  };
  if (venueId) {
    filterObj.where.venue = venueId;
  }

  async.auto({
    status: function(callback) {
      var statusQuery = status && status !== 'all' ? {
        sportsOrderStatus: status
      } : {};
      OrderStatusDefine.find(statusQuery).exec(function(err, results) {
        if (err) {
          return callback(err);
        }

        filterObj.where.or = results.map(function(result) {
          var pair = result.id.split('-');
          return {
            orderStatus: pair[0],
            paidStatus: pair[1]
          };
        });
        return callback(null, null);
      });
    },
    total: function totalFn(callback) {
      SportsOrder.count().exec(callback);
    },
    filterTotal: [
      'status',
      function filterTotalFn(callback) {
        SportsOrder.count(filterObj.where).exec(callback);
      }
    ],
    list: [
      'filterTotal',
      function listFn(callback, result) {
        if (!result.filterTotal) {
          return callback(null, []);
        }
        SportsOrder.find(filterObj)
          .populate('venue')
          .populate('event')
          .populate('ground')
          .exec(function(err, orders) {
            if (err) {
              return callback(err);
            }
            _.each(orders, function(order) {
              order.methods = [];
            });
            return callback(null, orders);
          });
      }
    ],
    totalPage: [
      'filterTotal',
      function totalPageFn(callback, result) {
        if (!result.filterTotal) {
          return callback(null, 0);
        }
        return callback(null, Math.ceil(result.filterTotal / Constant.listLimit));
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, {
      total: results.total,
      filterTotal: results.filterTotal,
      list: results.list,
      totalPage: results.totalPage,
      currentPage: page
    });
  });
};

exports.sportsOrderDetail = function(orderId, cb) {
  var whereObj = {
    id: orderId
  };

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
            return callback(Utils.error('订单不存在'));
          }

          return callback(null, detail);
        });
    },
    methods: function methodsFn(callback) {
      return callback(null, []);
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

exports.coachOrderList = function(coachId, status, page, sort, cb) {
  var filterObj = {
    where: {},
    limit: Constant.listLimit,
    skip: (page - 1) * Constant.listLimit,
    sort: sort
  };
  if (coachId) {
    filterObj.where.coach = coachId;
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

        filterObj.where.or = results.map(function(result) {
          var pair = result.id.split('-');
          return {
            orderStatus: pair[0],
            paidStatus: pair[1]
          };
        });
        return callback(null, null);
      });
    },
    total: function totalFn(callback) {
      CoachOrder.count().exec(callback);
    },
    filterTotal: [
      'status',
      function filterTotalFn(callback) {
        CoachOrder.count(filterObj.where).exec(callback);
      }
    ],
    list: [
      'filterTotal',
      function listFn(callback, result) {
        if (!result.filterTotal) {
          return callback(null, []);
        }
        CoachOrder.find(filterObj)
          .populate('location')
          .populate('venue')
          .populate('trainCase')
          .exec(callback);
      }
    ],
    process: [
      'list',
      function processFn(callback, result) {
        var ids = _.union(_.pluck(result.list, 'user'), _.pluck(result.list, 'coach'));
        User.withIds(ids, null, ['info'], true, function(err, users) {
          if (err) {
            return callback(err);
          }
          async.map(result.list, function(order, innercb) {
            order.user = users[order.user];
            order.coach = users[order.coach];
            order.methods = [];
            return innercb(null, order);
          }, callback);
        });
      }
    ],
    totalPage: [
      'filterTotal',
      function totalPageFn(callback, result) {
        if (!result.filterTotal) {
          return callback(null, 0);
        }
        return callback(null, Math.ceil(result.filterTotal / Constant.listLimit));
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, {
      total: results.total,
      filterTotal: results.filterTotal,
      list: results.process,
      totalPage: results.totalPage,
      currentPage: page
    });
  });
};

exports.coachOrderDetail = function(orderId, cb) {
  async.auto({
    order: function orderFn(callback) {
      CoachOrder.findOne(orderId)
        .populate('location')
        .populate('venue')
        .populate('trainCase')
        .populate('detail').exec(function(err, detail) {
          if (err) {
            return callback(err);
          }

          if (!detail) {
            return callback(Utils.error('订单不存在'));
          }

          return callback(null, detail);
        });
    },
    users: [
      'order',
      function usersFn(callback, result) {
        var ids = [
          result.order.user,
          result.order.coach
        ];
        User.withIds(ids, null, ['info'], true, callback);
      }
    ],
    methods: function methodsFn(callback) {
      return callback(null, []);
    }
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    var order = results.order;
    order.methods = results.methods;
    order.user = results.users[order.user];
    order.coach = results.users[order.coach];
    return cb(null, order);
  });
};
