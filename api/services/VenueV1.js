'use strict';

var squel = require('squel').useFlavour('postgres');

/**
 * 体育馆列表
 * @param {integer}     city       城市
 * @param {integer}     district   行政区
 * @param {string}      category   分类
 * @param {integer}     skip       忽略纪录数
 * @param {string}      search     搜索关键词
 * @param {string}      sort       排序方式
 * @param {float}       lat        纬度
 * @param {float}       lng        经度
 * @param {boolean}     simple     是否简单列表
 */
exports.venueList = function(city, district, category, lat, lng, skip, search, sort, simple, cb) {
  if (simple) {
    return VenueV1.venueSimpleList(city, district, category, lat, lng, skip, search, cb);
  }

  // TODO: 完成城市筛选及排序
  if (search) {
    search = '%' + search + '%';
  }

  var ids = [];

  var v = squel.select().from('venue');
  if (!_.isEmpty(search)) {
    v.where('name like ? or subname like ?', search, search);
  }
  v.where('city = ?', city);
  var cnts = v.clone();
  async.auto({
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
          cnts.where('district in ?', tmp);
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
        category: category,
        enabled: true
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
    total: [
      'filterByDistrict',
      'filterByCategory',
      function totalFn(callback) {
        cnts.field('count(*)', 'cnt');
        cnts.field('string_agg("id", \',\')', 'ids');
        cnts.where(
          'earth_box(ll_to_earth(?,?),?) @> ll_to_earth(latitude,longitude)',
          lat,
          lng,
          Constant.maxDistance
        );
        Venue.query(cnts.toString(), function(err, result) {
          if (err) {
            return callback(err);
          }
          result = result.rows.pop();
          if (+(result.cnt) > 0) {
            ids = result.ids.split(',');
            v.where('id in ?', ids);
          }
          return callback(null, +(result.cnt));
        });
      }
    ],
    list: [
      'total',
      function listFn(callback, result) {
        if (!result.total) {
          return callback(null, []);
        }
        v.field('id')
          .field(
            `round((point(${lat},${lng}) <@>
              point(latitude,longitude))::numeric * 1600,0)`,
            'distance'
          )
          .order(sort)
          .limit(Constant.listLimit)
          .offset(skip);
        Venue.query(v.toString(), function(err, venues) {
          return callback(err, venues.rows);
        });
      }
    ],
    process: [
      'list',
      function processFn(callback, result) {
        if (!result.total) {
          return callback(null, []);
        }
        async.map(result.list, function(obj, innercb) {
          Venue.findOne(obj.id).populate('events', {
            where: {
              enabled: true
            },
            sort: 'displayOrder'
          }).exec(function(err, venue) {
            if (err) {
              return innercb(err);
            }
            if (_.isEmpty(venue.events)) {
              venue.events = [];
            } else if (category) {
              var cobj = _.where(venue.events, {
                'category': category
              }).pop();
              if (cobj) {
                var newArr = [];
                var eventsArr = _.clone(venue.events);
                newArr.push(cobj);
                eventsArr = _.rest(eventsArr, {
                  'category': category
                });
                venue.events = _.union(newArr, eventsArr);
              }
            }

            venue.distance = +obj.distance;
            return innercb(null, venue);
          });
        }, function(err, results) {
          callback(err, results);
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

/**
 * 体育馆简单列表
 * @param {integer}     city       城市
 * @param {integer}     district   行政区
 * @param {string}      category   分类
 * @param {integer}     skip       忽略纪录数
 * @param {string}      search     搜索关键词
 * @param {float}       lat        纬度
 * @param {float}       lng        经度
 */
exports.venueSimpleList = function(city, district, category, lat, lng, skip, search, cb) {
  // TODO: 完成城市筛选及排序
  if (search) {
    search = '%' + search + '%';
  }

  var ids = [];

  var v = squel.select().from('venue');
  if (!_.isEmpty(search)) {
    v.where('name like ? or subname like ?', search, search);
  }
  v.where('city = ?', city);
  v.where('enabled = true');
  var cnts = v.clone();
  async.auto({
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
          cnts.where('district in ?', tmp);
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
        category: category,
        enabled: true
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
    total: [
      'filterByDistrict',
      'filterByCategory',
      function totalFn(callback) {
        cnts.field('count(*)', 'cnt');
        cnts.field('string_agg("id", \',\')', 'ids');
        cnts.where(
          'earth_box(ll_to_earth(?,?),?) @> ll_to_earth(latitude,longitude)',
          lat,
          lng,
          Constant.maxDistance
        );
        Venue.query(cnts.toString(), function(err, result) {
          if (err) {
            return callback(err);
          }
          result = result.rows.pop();
          if (+(result.cnt) > 0) {
            ids = result.ids.split(',');
            v.where('id in ?', ids);
          }
          return callback(null, +(result.cnt));
        });
      }
    ],
    list: [
      'total',
      function listFn(callback, result) {
        if (!result.total) {
          return callback(null, []);
        }
        v.field('id')
          .field(
            `round((point(${lat},${lng}) <@>
              point(latitude,longitude))::numeric * 1600,0)`,
            'distance'
          )
          .order('distance')
          .limit(Constant.listLimit)
          .offset(skip);
        Venue.query(v.toString(), function(err, venues) {
          return callback(err, venues.rows);
        });
      }
    ],
    process: [
      'list',
      function processFn(callback, result) {
        if (!result.total) {
          return callback(null, []);
        }
        async.map(result.list, function(obj, innercb) {
          Venue.findOne(obj.id).exec(function(err, venue) {
            if (err) {
              return innercb(err);
            }

            venue.distance = +obj.distance;
            return innercb(null, venue);
          });
        }, function(err, results) {
          callback(err, results);
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

/**
 * 体育馆详情
 * @param {string}   id       体育馆id
 * @param {float}    lat      纬度
 * @param {float}    lng      经度
 * @param {Function} cb       回调函数
 * @return {detail}   详情
 */
exports.venueDetail = function(id, lat, lng, cb) {
  async.auto({
    detail: function detailFn(callback) {
      Venue.findOne(id)
        .populate('attriubtes', {
          enabled: true
        }).populate('events', {
          enabled: true,
          sort: 'displayOrder'
        }).populate('charges', {
          enabled: true
        }).exec(function(err, result) {
          if (err) {
            return callback(err);
          }
          if (!result) {
            return callback(Utils.error(400041));
          }

          return callback(null, result);
        });
    },
    distance: [
      'detail',
      function distanceFn(callback, result) {
        Utils.getDistance(
          lat,
          lng,
          result.detail.latitude,
          result.detail.longitude,
          callback
        );
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    if (results.detail) {
      results.detail.distance = results.distance;
    }
    return cb(null, {
      detail: results.detail
    });
  });
};
