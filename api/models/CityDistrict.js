/**
 * CityDistrict.js
 *
 * @description :: 城市行政区类
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
'use strict';

function updateCache(values, next) {
  GlobalData.update('districts', values, next);
}

module.exports = {
  schema: true,

  attributes: {
    city: {
      model: 'city'
    },
    name: {
      type: 'json',
      defaultsTo: []
    },
    displayOrder: {
      type: 'integer',
      defaultsTo: 100
    },
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    toJSON: function() {
      var obj = this.toObject();
      delete obj.displayOrder;
      delete obj.enabled;
      delete obj.createdAt;
      delete obj.updatedAt;
      return obj;
    }
  },
  afterCreate: function(values, next) {
    updateCache(values, next);
  },
  afterUpdate: function(values, next) {
    updateCache(values, next);
  }
};
