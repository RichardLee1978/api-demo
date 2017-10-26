/**
 * GlobalData hook
 */
'use strict';

module.exports = function(sails) {
  /**
   * Module dependencies.
   */

  /**
   * Expose hook definition
   */
  return {
    initialize: function(next) {
      sails.after('hook:orm:loaded', function() {
        GlobalData.build(function(err) {
          if (err) {
            return next(err);
          }
          sails.log.debug('globals data init');
          return next();
        });
      });
    }
  };
};
