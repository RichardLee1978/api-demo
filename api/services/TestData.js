'use strict';

module.exports = {
  buildVenue: function(next) {
    async.auto({
      venue: function venueFn(callback) {
        Venue.count().exec(function(err, count) {
          if (err || count > 0) {
            return callback(err);
          }

          async.waterfall([
            function(cb) {
              Venue.create(Constant.VenueTestData).exec(cb);
            },
            function(venues, cb) {
              var ids = _.pluck(venues, 'id');

              async.each(ids, function(venueid, eachcb) {
                var data = _.shuffle(_.clone(
                  Constant.EventTestData));

                _.each(data, function(obj) {
                  obj.venue = venueid;
                });

                Event.create(data).exec(eachcb);
              }, function() {
                Event.find().exec(function(error, result) {
                  if (error) {
                    return callback(error);
                  }
                  var eids = _.pluck(result,
                    'id');
                  cb(null, eids);
                });
              });
            },
            function(events, cb) {
              async.each(events, function(eventid, eachcb) {
                var data = _.clone(Constant.GroundTestData);

                _.each(data, function(obj) {
                  obj.event = eventid;
                });

                Ground.create(data).exec(eachcb);
              }, function() {
                Ground.find().exec(function(error, result) {
                  if (error) {
                    return cb(error);
                  }
                  var gids = _.pluck(result,
                    'id');
                  cb(null, gids);
                });
              });
            },
            function(grounds, cb) {
              async.each(grounds, function(groundid, eachcb) {
                var data = {
                  'normalPrice': _.random(10, 15) * 10,
                  'promotionPrice': _.random(3, 8) * 10,
                  ground: groundid
                };

                GroundCharge.create(data).exec(eachcb);
              }, function() {
                cb(null, null);
              });
            }
          ], function(error) {
            return callback(error);
          });
        });
      },
      group: function groupFn(callback) {
        Group.count().exec(function(err, gcount) {
          if (err) {
            return callback(err);
          }
          if (gcount) {
            return callback();
          }

          User.count().exec(function(error, ucount) {
            if (error) {
              return callback(error);
            }
            if (!ucount) {
              return callback();
            }
            async.waterfall([
              function(cb) {
                User.find({
                  limit: 1,
                  sort: 'createdAt asc'
                }).exec(cb);
              },
              function(users, cb) {
                async.eachSeries(Constant.GroupTestData,
                  function(group, eachcb) {
                    GroupV1.createGroup(
                      users[0],
                      group.categories,
                      group.name,
                      group.desc,
                      group.type,
                      group.maxuser,
                      group.isPublic,
                      group.invite,
                      group.approval,
                      eachcb
                    );
                  },
                  function(_error) {
                    return cb(_error);
                  });
              }
            ], function(_error) {
              return callback(_error);
            });
          });
        });
      }
    }, function(err) {
      return next(err);
    });
  },
  buildTrain: function(next) {
    async.auto({
      targets: function targetsFn(callback) {
        TrainTarget.create(Constant.trainTargetInitData).exec(callback);
      },
      cases: [
        'targets',
        function casesFn(callback, result) {
          var ids = _.pluck(result.targets, 'id');
          var tmpArr = [];
          _.each(Constant.trainCaseInitData, function(obj) {
            obj.target = ids;
            tmpArr.push(obj);
          });
          TrainCase.create(tmpArr).exec(callback);
        }
      ]
    }, function(err, results) {
      if (err) {
        return next(err);
      }
      return next(null, results);
    });
  },
  buildCityAndDistricts: function(next) {
    async.auto({
      city: function cityFn(callback) {
        City.create({
          name: ['上海', 'Shanghai'],
          displayOrder: 1
        }).exec(callback);
      },
      district: function districtFn(callback) {
        CityDistrict.create(Constant.ShanghaiDistrictData).exec(callback);
      }
    }, function(err, results) {
      if (err) {
        return next(err);
      }
      return next(null, results);
    });
  }
};
