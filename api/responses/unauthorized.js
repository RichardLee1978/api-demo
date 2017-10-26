'use strict';
module.exports = function unauthorized(data) {
  var req = this.req;
  var res = this.res;

  res.status(401);

  var error = {
    method: req.method,
    status: 401,
    url: req.url,
    auth: req.headers.authorization,
    reqobj: req.allParams(),
    error: {
      'error_description': data
    },
    fix: false
  };

  ServerError.create(error).exec(function() {
    return res.jsonx({
      'error_description': data
    });
  });
};
