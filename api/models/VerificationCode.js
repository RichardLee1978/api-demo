/**
 * VerificationCode.js
 *
 * @description :: 验证码类
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
'use strict';

module.exports = {
  schema: true,
  autoPK: false,

  attributes: {
    id: {
      type: 'string',
      primaryKey: true
    },
    // 手机号
    phone: {
      type: 'string',
      defaultsTo: ''
    },
    // 验证码
    code: {
      type: 'string',
      defaultsTo: ''
    },
    // 验证码类型
    type: 'string',
    // 失效时间
    expire: 'datetime'
  }
};
