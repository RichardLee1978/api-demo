/**
 * SportsOrderController
 *
 * @description :: 运动订单相关
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
'use strict';

exports.orderList = function(req, res) {
  var venueId = req.param('venue'),
    page = req.param('page') || 1,
    sort = req.param('sort') || 'createdAt',
    status = req.param('status') || 'all';

  WebService.sportsOrderList(venueId, status, page, sort, function(err, result) {
    if (err) {
      return res.returnError(err);
    }
    return res.data(result);
  });
};

exports.orderDetail = function(req, res) {
  var orderId = req.param('orderId');

  WebService.sportsOrderDetail(orderId, function(err, result) {
    if (err) {
      return res.returnError(err);
    }
    return res.data(result);
  });
};
