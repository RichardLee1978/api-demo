'use strict';

module.exports = function(req, res, next) {
  var scopes = ['userresource', 'coachresource'];
  if (_.contains(scopes, req.scope)) {
    return next();
  } else {
    return res.unauthorized();
  }
};
