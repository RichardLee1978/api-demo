'use strict';
module.exports = function sendData(data) {
  var req = this.req;
  var res = this.res;

  res.status(200);
  var processTime = Date.now() - req.startTime.getTime();

  AccessLog.create({
    user: req.user ? req.user.id : '',
    client: req.client ? req.client.clientId : '',
    method: req.method,
    status: 200,
    url: req.url,
    reqobj: req.allParams(),
    processtime: processTime
  }).exec(function() {
    return res.jsonx(data);
  });
};
