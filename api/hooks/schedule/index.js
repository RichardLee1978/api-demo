/**
 * schedule hook
 */
'use strict';

module.exports = function(sails) {
  /**
   * Module dependencies.
   */

  var later = require('later');

  /**
   * Expose hook definition
   */
  return {
    initialize: function(next) {
      sails.after('hook:orm:loaded', function() {
        async.each(_.keys(sails.config.crontab), function(key, callback) {
          var cron = later.parse.cron(key);
          var val = sails.config.crontab[key];
          later.setInterval(val, cron);
          return callback();
        }, function(err) {
          return next(err);
        });
      });
    }
  };
};
