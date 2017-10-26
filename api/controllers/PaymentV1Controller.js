/**
 * PaymentV1Controller
 *
 * @description :: 支付端口
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

exports.createCharge = function(req, res) {
  var user = req.user,
    channel = req.param('channel'),
    objectId = req.param('objectId'),
    amount = req.param('amount'),
    ip = req.param('ip'),
    orderNo = req.param('order_no'),
    openId = req.param('open_id') || '',
    source = req.param('source');

  if (!channel || !objectId || !amount || !orderNo || !source) {
    return res.badRequest(400001);
  }

  Pingpp.createCharge(user, channel, objectId, amount, ip, orderNo, openId, source,
    function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    }
  );
};

exports.createEvent = function(req, res) {
  var eventObj = req.allParams();
  if (!eventObj.type) {
    return res.badRequest('miss parameter');
  }

  Pingpp.createEvent(eventObj, function(err) {
    if (err) {
      return res.serverError(err);
    }
    return res.data({
      result: 'success'
    });
  });
};

exports.createAlipaySyncEvent = function(req, res) {
  var aObj = {};
  aObj.type = req.param('type');
  aObj.body = req.param('body');
  aObj.isSuccess = req.param('is_success');
  aObj.notifyId = req.param('notify_id');
  aObj.notifyTime = req.param('notify_time');
  aObj.notifyType = req.param('notify_type');
  aObj.outTradeNo = req.param('out_trade_no');
  aObj.paymentType = req.param('payment_type');
  aObj.sellerId = req.param('seller_id');
  aObj.service = req.param('service');
  aObj.subject = req.param('subject');
  aObj.totalFee = req.param('total_fee');
  aObj.tradeNo = req.param('trade_no');
  aObj.tradeStatus = req.param('trade_status');
  aObj.sign = req.param('sign');
  aObj.signType = req.param('sign_type');

  Pingpp.createAlipaySyncEvent(aObj, function(err) {
    if (err) {
      return res.serverError(err);
    }
    return res.data({
      result: 'success'
    });
  });
};
