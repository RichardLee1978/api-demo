/**
* Activity.js
*
* @description :: 活动类
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
    // 活动编号，用于网页显示
    serialNumber: {
      type: 'string',
      defaultsTo: ''
    },
    // 标题
    title: {
      type: 'string',
      defaultsTo: ''
    },
    // 子标题
    subtitle: {
      type: 'string',
      defaultsTo: ''
    },
    // 活动类型
    // contest 比赛
    type: {
      type: 'string',
      defaultsTo: ''
    },
    // 活动关联运动类别
    category: {
      type: 'string',
      defaultsTo: ''
    },
    // 活动场馆
    venue: {
      type: 'json',
      defaultsTo: []
    },
    // 活动场地
    location: {
      type: 'json',
      defaultsTo: []
    },
    // 最大报名人数，0为不限制
    maxPeople: {
      type: 'Integer',
      defaultsTo: 0
    },
    // 报名开始日期
    openDate: {
      type: 'string',
      defaultsTo: ''
    },
    // 报名截止日期
    closingDate: {
      type: 'string',
      defaultsTo: ''
    },
    // 开始日期
    startDate: {
      type: 'string',
      defaultsTo: ''
    },
    // 结束日期，留空表示当天结束
    endDate: {
      type: 'string',
      defaultsTo: ''
    },
    // 开始时间
    startTime: {
      type: 'string',
      defaultsTo: ''
    },
    // 结束时间
    endTime: {
      type: 'string',
      defaultsTo: ''
    },
    // 活动描述
    description: {
      type: 'string',
      defaultsTo: ''
    },
    // 预订须知
    attention: {
      type: 'string',
      defaultsTo: ''
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    // 是否推荐
    recommend: {
      type: 'boolean',
      defaultsTo: false
    },
    // 排序
    displayOrder: {
      type: 'integer',
      defaultsTo: 100
    },
    // 正常金额
    normalPrice: {
      type: 'float',
      defaultsTo: 0
    },
    // 优惠金额
    promotionPrice: {
      type: 'float',
      defaultsTo: 0
    },
    // 支付方式
    payment: {
      type: 'json',
      defaultsTo: {
        wechat: ['alipay_wap', 'wx_pub'],
        web: ['alipay_pc_direct', 'alipay_qr', 'wx_pub_qr'],
        client: ['alipay', 'wx']
      }
    },

    activityName: function() {
      if (this.subtitle) {
        return `${this.title}(${this.subtitle})`;
      } else {
        return this.title;
      }
    },

    // 比赛条目详情
    contest: {
      collection: 'activitycontestdetail',
      via: 'activity'
    }
  },
  beforeCreate: function(values, next) {
    next();
  },
  beforeUpdate: function(values, next) {
    next();
  }
};
