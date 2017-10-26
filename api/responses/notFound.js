'use strict';
module.exports = function notFound(data) {
  var req = this.req;
  var res = this.res;

  res.status(Constant.notFound);

  if (!data) {
    data = {
      'error_description': 'Not found'
    };
  }

  ServerError.create({
    user: req.user,
    client: req.client,
    method: req.method,
    status: Constant.notFound,
    url: req.url,
    auth: req.headers.authorization,
    reqobj: req.allParams(),
    fix: false
  }).exec(function() {
    return res.jsonx(data);
  });
};
