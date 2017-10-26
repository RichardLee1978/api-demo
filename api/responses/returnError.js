'use strict';

module.exports = function(err) {
  var res = this.res;

  if (_.isNumber(err.message)) {
    switch (Math.floor(err.message / 1000)) {
      case 400:
        return res.badRequest(err.message);
      case 401:
        return res.unauthorized(err.message);
      case 403:
        return res.forbidden(err.message);
      case 404:
        return res.notFound(err.message);
      default:
        if (err.status < 500) {
          res.status(err.status);
          return res.send(err.message);
        } else {
          return res.serverError(err.message);
        }
    }
  } else {
    return res.serverError(err);
  }
};
