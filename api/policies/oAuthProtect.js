/**
 * OAuthProtect policy
 *
 * @module      :: Policy
 * @description :: 对授权通道进行校验
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
    var types = ['password', 'client_credentials', 'refresh_token'];
    if (_.contains(types, grantType)) {
      if (!authorization &&
        (!req.param('client_id') || !req.param('client_secret'))) {
        return res.json(Constant.badRequest, {
          'error_description': 'missing client parameter'
        });
      }
      return next();
    } else if (grantType === 'authorization_code') {
      return res.json(Constant.badRequest, {
        'error_description': 'does not support authorization code grant'
      });
    } else {
      return res.notFound();
    }
  }
};
