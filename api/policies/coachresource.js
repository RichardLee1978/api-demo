'use strict';

module.exports = function(req, res, next) {
  var scopes = ['coachresource'];
  if (_.contains(scopes, req.scope)) {
    return next();
  } else {
    return res.unauthorized();
  }
};
