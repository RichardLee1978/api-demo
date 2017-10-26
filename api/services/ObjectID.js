'use strict';
var ObjectID = require('bson-objectid');
module.exports = {
  id: function() {
    return ObjectID.generate().toUpperCase();
  }
};
