/**
 * ObjectTime.js
 *
 * @description :: 纪录对象的最后更新时间，用于更新
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

'use strict';

module.exports = {
  connection: 'redis',
  schema: true,

  attributes: {
    type: 'string',
    lastupdate: 'datetime'
  },

  build: function(callback) {
    async.auto({
      info: function infoFn(infocb) {
        System.find({
          max: 'updatedAt'
        }).exec(infocb);
      },
      categories: function categoriesFn(categorycb) {
        Category.find({
          max: 'updatedAt'
        }).exec(categorycb);
      },
      cities: function citiesFn(citycb) {
        City.find({
          max: 'updatedAt'
        }).exec(citycb);
      },
      districts: function districtsFn(districtcb) {
        CityDistrict.find({
          max: 'updatedAt'
        }).exec(districtcb);
      },
      cases: function casesFn(casecb) {
        TrainCase.find({
          max: 'updatedAt'
        }).exec(casecb);
      },
      targets: function targetsFn(targetcb) {
        TrainTarget.find({
          max: 'updatedAt'
        }).exec(targetcb);
      }
    }, function(error, results) {
      if (error) {
        return callback(error);
      }

      var keys = _.keys(results);
      ObjectTime.find({
        type: keys
      }).exec(function(err, ots) {
        if (err) {
          return callback(err);
        }
        _.each(ots, function(ot) {
          if (results[ot.type]) {
            var value = results[ot.type][0].updatedat;
            if (value) {
              ot.lastupdate = value;
              ot.save();
              delete results[ot.type];
            }
          }
        });

        if (_.isEmpty(results)) {
          return callback(null, null);
        }else {
          var tObj = [];
          _.forIn(results, function(vobj, key) {
            tObj.push({
              type: key,
              lastupdate: vobj.pop().updatedat
            });
          });
          ObjectTime.create(tObj).exec(callback);
        }
      });
    });
  }
};
