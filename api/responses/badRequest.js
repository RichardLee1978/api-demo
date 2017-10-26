'use strict';
module.exports = function badRequest(data) {
  var req = this.req;
  var res = this.res;

  res.status(400);

  var errordata;
  if (_.isNumber(data)) {
    errordata = data;
  } else {
    errordata = {
      'error_description': data
    };
  }

  var error = {
    user: req.user,
    client: req.client,
    method: req.method,
    status: 400,
    url: req.url,
    auth: req.headers.authorization,
    reqobj: req.allParams(),
    error: errordata,
    fix: false
  };

  ServerError.create(error).exec(function() {
    return res.jsonx({
      'error_code': data
    });
  });
};
