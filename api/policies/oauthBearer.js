'use strict';

var passport = require('passport');

module.exports = function(req, res, next) {
  passport.authenticate('bearer', function(err, user, info) {
    if (err) {
      return res.returnError(err);
    }
    if (_.isEmpty(user) && !info.client) {
      req.client = undefined;
      return res.unauthorized('permission_denied');
    }

    req.client = info.client;
    delete info.client;

    if (info) {
      req.scope = info.scope;
    }

    delete req.query.access_token;
    req.user = user;
    return next();
  })(req, res);
};
