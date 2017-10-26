/**
* PingppCharge.js
*
* @description :: pingpp付款对象类
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
    // 支付用户
    user: {
      model: 'user'
    },
    // 标题
    subject: {
      type: 'string',
      defaultsTo: ''
    },
    // 数据
    body: {
      type: 'string',
      defaultsTo: ''
    },
    // 订单号
    orderNo: {
      type: 'string',
      defaultsTo: ''
    },
    // 渠道
    channel: {
      type: 'string',
      defaultsTo: ''
    },
    // 金额
    amount: {
      type: 'integer',
      defaultsTo: 0
    },
    // 货币代码
    currency: {
      type: 'string',
      defaultsTo: 'cny'
    },
    // 支付ip
    clientIp: {
      type: 'string',
      defaultsTo: ''
    },
    // 微信openid
    openId: {
      type: 'string',
      defaultsTo: ''
    },
    // 哪个app
    app: {
      type: 'string',
      defaultsTo: ''
    },
    // 来源
    source: {
      type: 'string',
      defaultsTo: ''
    },
    // 回执
    credentials: {
      type: 'json',
      defaultsTo: {}
    },
    // 已支付
    paidSuccess: {
      type: 'boolean',
      defaultsTo: false
    }
  },
  beforeCreate: function(values, next) {
    next();
  },
  beforeUpdate: function(values, next) {
    next();
  }
};
