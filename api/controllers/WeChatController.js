/**
 * WeChatController
 *
 * @description :: 微信相关
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict';

exports.userInfo = function(req, res) {
  var unionId = req.param('unionId'),
    phone = req.param('phone'),
    activityNo = req.param('activityNo');

  if ((!unionId && !phone) || !activityNo) {
    return res.badRequest('参数错误');
  }

  WeChatService.userInfo(unionId, phone, activityNo, function(err, result) {
    if (err) {
      if (_.isString(err)) {
        return res.badRequest(err);
      } else {
        return res.serverError(err);
      }
    }
    return res.data(result);
  });
};
exports.registerUser = function(req, res) {
  var info = {};
  info.accessToken = req.param('accessToken');
  info.expiresIn = req.param('expiresIn');

  info.refreshToken = req.param('refreshToken');
  info.openId = req.param('openId');
  info.unionId = req.param('unionId');
  info.scope = req.param('scope');

  var nickname = req.param('nickname'),
    realname = req.param('name'),
    birthday = req.param('birthday'),
    gender = req.param('gender'),
    phone = req.param('phone'),
    ip = req.param('ip');

  if (!info.accessToken || !info.expiresIn || !info.refreshToken ||
    !info.openId || !info.scope || !info.unionId) {
    return res.badRequest('参数错误');
  }

  if (!nickname || !realname || !birthday || !gender || !phone || !ip) {
    return res.badRequest('参数错误');
  }

  WeChatService.registerUser(phone, nickname, ip, realname, birthday, gender, info,
    function(err, result) {
      if (err) {
        if (_.isString(err)) {
          return res.badRequest(err);
        } else {
          return res.serverError(err);
        }
      }
      return res.data(result);
    });
};
exports.userLogin = function(req, res) {
  var info = {};
  info.accessToken = req.param('accessToken');
  info.expiresIn = req.param('expiresIn');

  info.refreshToken = req.param('refreshToken');
  info.openId = req.param('openId');
  info.unionId = req.param('unionId');
  info.scope = req.param('scope');

  var phone = req.param('phone'),
    password = req.param('password'),
    activityNo = req.param('activityNo');

  if (!phone || !activityNo || !password || !info.accessToken || !info.expiresIn ||
    !info.refreshToken || !info.openId || !info.scope || !info.unionId) {
    return res.badRequest('参数错误');
  }

  WeChatService.userLogin(phone, password, info, activityNo, function(err, result) {
    if (err) {
      if (_.isString(err)) {
        return res.badRequest(err);
      } else {
        return res.serverError(err);
      }
    }
    return res.data(result);
  });
};
exports.linkUser = function(req, res) {
  var info = {};
  info.accessToken = req.param('accessToken');
  info.expiresIn = req.param('expiresIn');

  info.refreshToken = req.param('refreshToken');
  info.openId = req.param('openId');
  info.unionId = req.param('unionId');
  info.scope = req.param('scope');

  var phone = req.param('phone'),
    activityNo = req.param('activityNo');

  if (!phone || !activityNo || !info.accessToken || !info.expiresIn ||
    !info.refreshToken || !info.openId || !info.scope || !info.unionId) {
    return res.badRequest('参数错误');
  }

  WeChatService.linkUser(phone, info, activityNo, function(err, result) {
    if (err) {
      if (_.isString(err)) {
        return res.badRequest(err);
      } else {
        return res.serverError(err);
      }
    }
    return res.data(result);
  });
};
exports.activityInfo = function(req, res) {
  var activityNo = req.param('activityNo');
  if (!activityNo) {
    return req.badRequest('参数错误');
  }

  WeChatService.activityInfo(activityNo, function(err, result) {
    if (err) {
      if (_.isString(err)) {
        return res.badRequest(err);
      } else {
        return res.serverError(err);
      }
    }
    return res.data(result);
  });
};
exports.activityParticipants = function(req, res) {
  var activityNo = req.param('activityNo');
  WeChatService.activityParticipants(activityNo, function(err, result) {
    if (err) {
      if (_.isString(err)) {
        return res.badRequest(err);
      } else {
        return res.serverError(err);
      }
    }
    return res.data(result);
  });
};
exports.createActivityOrder = function(req, res) {
  var activityNo = req.param('activityNo'),
    order = req.param('order'),
    peoples = req.param('peoples');
  // peoples:
  // [
  //  {
  //    amount:0,event:'',
  //    participants:[
  //      {user:xxx,name:xxx,phone:xxx,birthday:xxx,gender:xxx}
  //    ]
  //  }
  // ]
  // order:
  // {
  //   orderNo: orderNo,
  //   user: user,
  //   name: name,
  //   phone: phone,
  //   amount: amount,
  //   payment: payment,
  //   paymentNumber: paymentNumber
  // }

  if (!activityNo || !order.orderNo || !order.user || !order.name || !order.phone ||
    !order.payment || !order.paymentNumber || !peoples) {
    return res.badRequest('参数错误');
  }

  WeChatService.createActivityOrder(activityNo, order, peoples, function(err, result) {
    if (err) {
      if (_.isString(err)) {
        return res.badRequest(err);
      } else {
        return res.serverError(err);
      }
    }
    return res.data(result);
  });
};
