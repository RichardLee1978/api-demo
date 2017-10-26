'use strict';

module.exports = {
  update: function(type, values, callback) {
    ObjectCache.findOneByType(type).exec(function(err, obj) {
      if (err) {
        return callback(err);
      }
      switch (type) {
        case 'userStatus':
          var userstatus = GlobalData.makeData('userStatus', values);
          _.remove(obj.data.coachorder, function(_obj) {
            return _obj.id === userstatus.coachorder.id;
          });
          _.remove(obj.data.sportsorder, function(_obj) {
            return _obj.id === userstatus.sportsorder.id;
          });
          obj.data.coachorder.push(userstatus.coachorder);
          obj.data.sportsorder.push(userstatus.sportsorder);
          break;
        case 'coachStatus':
          var coachstatus = GlobalData.makeData('coachStatus', values);
          _.remove(obj.data.coachorder, function(_obj) {
            return _obj.id === coachstatus.coachorder.id;
          });
          obj.data.coachorder.push(coachstatus.coachorder);
          break;
        case 'categories':
          obj.data[values.name] = GlobalData.makeData(type, values);
          break;
        default:
          obj.data[values.id] = GlobalData.makeData(type, values);
          break;
      }
      obj.save(callback);
    });
  },

  categories: function(callback) {
    var type = 'categories';
    Category.find().sort('displayOrder').exec(function(err, list) {
      if (err) {
        return callback(err);
      }
      var categories = {};
      async.each(list, function(category, categorycb) {
        categories[category.name] = GlobalData.makeData(type, category);
        categorycb();
      }, function() {
        ObjectCache.findOneByType(type).exec(function(_err, obj) {
          if (_err) {
            return callback(_err);
          }
          if (obj) {
            obj.data = categories;
            obj.save(callback);
          }else {
            ObjectCache.create({
              type: type,
              data: categories
            }).exec(callback);
          }
        });
      });
    });
  },

  cities: function(callback) {
    var type = 'cities';
    City.find({
      where: {
        enabled: true
      },
      sort: 'displayOrder'
    }).exec(function(err, list) {
      if (err) {
        return callback(err);
      }
      var cities = {};
      async.each(list, function(city, citycb) {
        cities[city.id] = GlobalData.makeData(type, city);
        citycb();
      }, function() {
        ObjectCache.findOneByType(type).exec(function(_err, obj) {
          if (_err) {
            return callback(_err);
          }
          if (obj) {
            obj.data = cities;
            obj.save(callback);
          }else {
            ObjectCache.create({
              type: type,
              data: cities
            }).exec(callback);
          }
        });
      });
    });
  },

  districts: function(callback) {
    var type = 'districts';
    CityDistrict.find({
      where: {
        enabled: true
      },
      sort: 'displayOrder'
    }).exec(function(err, list) {
      if (err) {
        return callback(err);
      }
      var districts = {};
      async.each(list, function(cdobj, districtcb) {
        districts[cdobj.id] = GlobalData.makeData(type, cdobj);
        districtcb();
      }, function() {
        ObjectCache.findOneByType(type).exec(function(_err, obj) {
          if (_err) {
            return callback(_err);
          }
          if (obj) {
            obj.data = districts;
            obj.save(callback);
          }else {
            ObjectCache.create({
              type: type,
              data: districts
            }).exec(callback);
          }
        });
      });
    });
  },

  cases: function(callback) {
    var type = 'cases';
    TrainCase.find({
      where: {
        enabled: true,
        coach: null
      }
    }).exec(function(err, list) {
      if (err) {
        return callback(err);
      }
      var cases = {};
      async.each(list, function(cobj, casecb) {
        cases[cobj.id] = GlobalData.makeData(type, cobj);
        casecb();
      }, function() {
        ObjectCache.findOneByType(type).exec(function(_err, obj) {
          if (_err) {
            return callback(_err);
          }
          if (obj) {
            obj.data = cases;
            obj.save(callback);
          }else {
            ObjectCache.create({
              type: type,
              data: cases
            }).exec(callback);
          }
        });
      });
    });
  },

  targets: function(callback) {
    var type = 'targets';
    TrainTarget.find({
      where: {
        enabled: true
      }
    }).exec(function(err, list) {
      if (err) {
        return callback(err);
      }
      var targets = {};
      async.each(list, function(cobj, targetcb) {
        targets[cobj.id] = GlobalData.makeData(type, cobj);
        targetcb();
      }, function() {
        ObjectCache.findOneByType(type).exec(function(_err, obj) {
          if (_err) {
            return callback(_err);
          }
          if (obj) {
            obj.data = targets;
            obj.save(callback);
          }else {
            ObjectCache.create({
              type: type,
              data: targets
            }).exec(callback);
          }
        });
      });
    });
  },

  orderStatus: function(callback) {
    OrderStatusDefine.find().exec(function(err, status) {
      if (err) {
        return callback(err);
      }
      var userStatus = {
        coachorder: [],
        sportsorder: []
      }, coachStatus = {
        coachorder: []
      };

      _.each(status, function(obj) {
        var uobj = GlobalData.makeData('userStatus', obj);
        var cobj = GlobalData.makeData('coachStatus', obj);

        userStatus.coachorder.push(uobj.coachorder);
        userStatus.sportsorder.push(uobj.sportsorder);

        coachStatus.coachorder.push(cobj.coachorder);
      });

      async.auto({
        userStatus: function userStatusFn(savecb) {
          ObjectCache.findOneByType('userStatus').exec(function(_err, obj) {
            if (_err) {
              return savecb(_err);
            }
            if (obj) {
              obj.data = userStatus;
              obj.save(savecb);
            }else {
              ObjectCache.create({
                type: 'userStatus',
                data: userStatus
              }).exec(savecb);
            }
          });
        },
        coachStatus: function coachStatusFn(savecb) {
          ObjectCache.findOneByType('coachStatus').exec(function(_err, obj) {
            if (_err) {
              return savecb(_err);
            }
            if (obj) {
              obj.data = coachStatus;
              obj.save(savecb);
            }else {
              ObjectCache.create({
                type: 'coachStatus',
                data: coachStatus
              }).exec(savecb);
            }
          });
        }
      }, function(error, results) {
        if (err) {
          return callback(err);
        }
        return callback(null, results);
      });
    });
  },

  errorDescription: function(callback) {
    var type = 'errorDescription';
    ErrorDescription.find({
      sort: {
        code: 'DESC'
      }
    }).exec(function(err, results) {
      if (err) {
        return callback(err);
      }
      var errors = _.map(results, function(error) {
        return GlobalData.makeData(type, error);
      });
      ObjectCache.findOneByType(type).exec(function(_err, obj) {
        if (_err) {
          return callback(_err);
        }
        if (obj) {
          obj.data = errors;
          obj.save(callback);
        }else {
          ObjectCache.create({
            type: type,
            data: errors
          }).exec(callback);
        }
      });
    });
  },

  build: function(next) {
    async.auto({
      categories: function categoriesFn(callback) {
        GlobalData.categories(callback);
      },
      cities: function citiesFn(callback) {
        GlobalData.cities(callback);
      },
      districts: function districtsFn(callback) {
        GlobalData.districts(callback);
      },
      cases: function casesFn(callback) {
        GlobalData.cases(callback);
      },
      targets: function targetsFn(callback) {
        GlobalData.targets(callback);
      },
      orderStatus: function orderStatusFn(callback) {
        GlobalData.orderStatus(callback);
      },
      errorDescription: function errorDescriptionFn(callback) {
        GlobalData.errorDescription(callback);
      }
    }, function(err, results) {
      if (err) {
        return next(err);
      }
      return next(null, results);
    });
  },

  makeData: function(type, values) {
    var data = {};
    switch (type) {
      case 'categories':
        data = {
          name: values.name,
          lang: values.lang,
          color: values.color,
          volume: values.volume,
          displayOrder: +values.displayOrder
        };
        break;
      case 'cities':
        data = {
          id: values.id,
          name: values.name
        };
        break;
      case 'districts':
        data = {
          id: values.id,
          name: values.name,
          city: +values.city,
          displayOrder: +values.displayOrder
        };
        break;
      case 'cases':
        data = {
          id: values.id,
          name: values.name,
          target: values.target,
          minDuration: values.minDuration
        };
        break;
      case 'targets':
        data = {
          id: values.id,
          name: values.name,
          unit: values.unit
        };
        break;
      case 'userStatus':
        var ucoachorder = {},
          usportsorder = {};

        ucoachorder = {
          id: values.id,
          lang: values.base,
          status: values.coachOrderStatus
        };
        if (!_.isEmpty(values.userCoachOrder)) {
          ucoachorder.lang = values.userCoachOrder;
        }
        usportsorder = {
          id: values.id,
          lang: values.base,
          status: values.sportsOrderStatus
        };
        if (!_.isEmpty(values.userSportsOrder)) {
          usportsorder.lang = values.userSportsOrder;
        }

        data = {
          coachorder: ucoachorder,
          sportsorder: usportsorder
        };
        break;
      case 'coachStatus':
        var ccoachorder = {};

        ccoachorder = {
          id: values.id,
          lang: values.base,
          status: values.coachOrderStatus
        };
        if (!_.isEmpty(values.userCoachOrder)) {
          ccoachorder.lang = values.userCoachOrder;
        }

        data = {
          coachorder: ccoachorder
        };
        break;
      case 'errorDescription':
        data = {
          type: values.type,
          code: values.code,
          error: values.error
        };
        break;
    }
    return data;
  }
};
