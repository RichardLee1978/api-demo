'use strict';

module.exports = function(req, res, next) {
  if (_.isEmpty(req.user)) {
    return next();
  }
  var obj = {
    lastActivity: new Date()
  };
  if (req.query.lat && req.query.lng) {
    obj.latitude = req.query.lat;
    obj.longitude = req.query.lng;
  }
  UserExtra.update(req.user.id, obj).exec(next);
};
