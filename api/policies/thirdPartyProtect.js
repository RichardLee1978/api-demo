/**
 * thirdPartyProtect policy
 *
 * @module      :: Policy
 * @description :: 对第三方授权通道进行校验
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
'use strict';

module.exports = function(req, res, next) {
  var grantType = req.param('grant_type');
  if (!grantType) {
    return res.json(Constant.badRequest, {
      'error_description': 'missing grant_type parameter'
    });
  } else {
    var authorization = req.headers.authorization;
    if (_.contains(['password'], grantType)) {
      if (!authorization &&
        (!req.param('client_id') && !req.param('client_secret'))) {
        return res.json(Constant.badRequest, {
          'error_description': 'missing client parameter'
        });
      }
      if (!req.param('id')) {
        return res.json(Constant.badRequest, {
          'error_description': 'missing id parameter'
        });
      }
      return next();
    } else {
      return res.notFound();
    }
  }
};
