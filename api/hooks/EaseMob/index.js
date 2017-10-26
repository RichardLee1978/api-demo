/**
 * EaseMob hook
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
        if (process.env.EASEMOB_ID && process.env.EASEMOB_SECRET) {
          EaseMob.getToken(next);
        } else {
          next();
        }
      });
    }
  };
};
