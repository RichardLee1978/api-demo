'use strict';

exports.createCharge = function(user, channel, objectId, amount, ip, orderNo, openId, source, cb) {
  var pingpp = require('pingpp')(process.env.PINGXX_KEY);
  var subject = `${source} - ${objectId}`;
  async.auto({
    sendToPingpp: function sendToPingppFn(callback) {
      var extra = {};
      switch (channel) {
        case 'wx_pub':
          if (openId) {
            extra.open_id = openId;
          }
          break;
        case 'alipay_wap':
          extra.success_url = `${process.env.HOST}/v1/payment/alipay/success`;
          extra.cancel_url = `${process.env.HOST}/v1/payment/alipay/cancel`;
          break;
      }
      var cObj = {
        order_no: orderNo,
        app: {
          id: process.env.PINGXX_ID
        },
        channel: channel,
        amount: amount,
        client_ip: ip,
        currency: 'cny',
        subject: subject,
        body: orderNo,
        extra: extra
      };
      pingpp.charges.create(cObj, function(err, charge) {
        if (err) {
          sails.log.error(err);
          return callback(Utils.error('支付接口错误'));
        }
        return callback(null, charge);
      });
    },
    chargeObj: [
      'sendToPingpp',
      function chargeObjFn(callback, result) {
        var userId = user ? user.id : '';
        var obj = {
          user: userId,
          channel: channel,
          subject: subject,
          amount: amount,
          clientIp: ip,
          orderNo: orderNo,
          openId: openId,
          app: process.env.PINGXX_ID,
          source: source,
          credentials: result.sendToPingpp
        };
        PingppCharge.create(obj).exec(callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.sendToPingpp);
  });
};

exports.createEvent = function(eventObj, cb) {
  eventObj.eventId = eventObj.id;
  eventObj.eventCreated = eventObj.created;
  delete eventObj.id;
  delete eventObj.created;

  PingppEvent.create(eventObj).exec(cb);
};

exports.createAlipaySyncEvent = function(aObj, cb) {
  AlipaySyncEvents.create(aObj).exec(cb);
};
