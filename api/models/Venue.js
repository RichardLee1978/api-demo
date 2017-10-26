/**
 * Venue.js
 *
 * @description :: 运动馆类，包含体育馆和健身会所等类型
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
    // 名称
    name: 'string',
    // 子名称
    subname: {
      type: 'string',
      defaultsTo: ''
    },
    // 城市
    city: {
      model: 'city'
    },
    // 行政区
    district: {
      model: 'citydistrict'
    },
    // 商圈
    cbd: {
      type: 'string',
      defaultsTo: ''
    },
    // 地址
    address: {
      type: 'string',
      defaultsTo: ''
    },
    // 电话
    phone: {
      type: 'string',
      defaultsTo: ''
    },
    // 营业时间
    opentime: {
      type: 'string',
      defaultsTo: '0900'
    },
    closetime: {
      type: 'string',
      defaultsTo: '2200'
    },
    // 是否连锁
    chain: {
      type: 'boolean',
      defaultsTo: false
    },
    // 是否总店
    master: {
      type: 'boolean',
      defaultsTo: false
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    // 是否认证
    verify: {
      type: 'boolean',
      defaultsTo: false
    },
    // 是否支持在线支付
    onlinePayment: {
      type: 'boolean',
      defaultsTo: false
    },
    // 支付方式
    paymentMethod: {
      type: 'json',
      defaultsTo: []
    },
    // 描述
    description: {
      type: 'text',
      defaultsTo: ''
    },
    // 附近交通
    traffic: {
      type: 'json',
      defaultsTo: []
    },
    // 类别
    type: {
      type: 'string',
      defaultsTo: 'venue'
    },
    // 平均价格
    avgPrice: 'float',
    // 浏览次数
    viewCount: {
      type: 'integer',
      defaultsTo: 0
    },
    // 收藏次数
    favCount: {
      type: 'integer',
      defaultsTo: 0
    },
    // 纬度
    latitude: 'float',
    // 经度
    longitude: 'float',
    // 评分
    score: {
      type: 'float',
      defaultsTo: 3.5
    },
    // 签约类型
    contract: {
      type: 'json',
      defaultsTo: []
    },
    // 显示顺序
    displayOrder: {
      type: 'integer',
      defaultsTo: 100
    },
    // 主图
    image: {
      type: 'json',
      defaultsTo: []
    },
    // 是否推荐
    recommend: {
      type: 'boolean',
      defaultsTo: false
    },

    attriubtes: {
      collection: 'venueattribute',
      via: 'venue'
    },
    events: {
      collection: 'event',
      via: 'venue'
    },
    charges: {
      collection: 'venuecharge',
      via: 'event'
    },
    orders: {
      collection: 'sportsorder',
      via: 'venue'
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.createdAt;
      delete obj.updatedAt;
      delete obj.enabled;
      delete obj.type;
      return obj;
    }
  },

  beforeCreate: function(values, next) {
    if (values.latitude && values.longitude) {
      values.latitude = (+values.latitude).toFixed(6);
      values.longitude = (+values.longitude).toFixed(6);
    }

    next();
  },
  beforeUpdate: function(values, next) {
    if (values.latitude && values.longitude) {
      values.latitude = (+values.latitude).toFixed(6);
      values.longitude = (+values.longitude).toFixed(6);
    }

    next();
  }
};
