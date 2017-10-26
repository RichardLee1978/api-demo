/**
* AlipaySyncEvents.js
*
* @description :: 支付宝同步通知类
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  schema: true,
  autoPK: false,

  attributes: {
    id: {
      type: 'string',
      primaryKey: true
    },
    type: {
      type: 'string'
    },
    body: {
      type: 'string'
    },
    isSuccess: {
      type: 'string'
    },
    notifyId: {
      type: 'string'
    },
    notifyTime: {
      type: 'datetime'
    },
    notifyType: {
      type: 'string'
    },
    outTradeNo: {
      type: 'string'
    },
    paymentType: {
      type: 'string'
    },
    sellerId: {
      type: 'string'
    },
    service: {
      type: 'string'
    },
    subject: {
      type: 'string'
    },
    totalFee: {
      type: 'float'
    },
    tradeNo: {
      type: 'string'
    },
    tradeStatus: {
      type: 'string'
    },
    sign: {
      type: 'string'
    },
    signType: {
      type: 'string'
    }
  },
  beforeCreate: function(values, next) {
    next();
  },
  beforeUpdate: function(values, next) {
    next();
  }
};
