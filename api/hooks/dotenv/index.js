/**
 * DotEnv hook
 */
'use strict';

module.exports = function(sails) {
  return {
    initialize: function(cb) {
      var fs = require('fs');
      fs.exists(sails.config.appPath + '/.env', function(exists) {
        if (exists) {
          require('dotenv').load();
          return cb();
        } else {
          return cb();
        }
      });
    }
  };
};
