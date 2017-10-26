/**
 * CoachorderController
 *
 * @description :: 教练订单相关
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict';

exports.orderList = function(req, res) {
  var coachId = req.param('coach'),
    page = req.param('page') || 1,
    sort = req.param('sort') || 'createdAt',
    status = req.param('status') || 'all';

  WebService.coachOrderList(coachId, status, page, sort, function(err, result) {
    if (err) {
      return res.returnError(err);
    }
    return res.data(result);
  });
};

exports.orderDetail = function(req, res) {
  var orderId = req.param('orderId');

  WebService.coachOrderDetail(orderId, function(err, result) {
    if (err) {
      return res.returnError(err);
    }
    return res.data(result);
  });
};
