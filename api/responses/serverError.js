'use strict';
module.exports = function serverError(data) {
  var req = this.req;
  var res = this.res;

  res.status(Constant.serverError);
  sails.log.error(data);

  var error = {
    user: req.user,
    client: req.client,
    method: req.method,
    status: Constant.serverError,
    url: req.url,
    auth: req.headers.authorization,
    reqobj: req.allParams(),
    error: {
      error: data
    },
    fix: false
  };

  ServerError.create(error).exec(function() {
    return res.jsonx({
      'error_code': 500
    });
  });
};
