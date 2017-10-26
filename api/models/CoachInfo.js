/**
 * CoachInfo.js
 *
 * @description :: 教练基本信息类
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
'use strict';

function convertRegions(values, next) {
  values.regions = _.map(values.regions, function(did) {
    return `${did}`;
  });
  next();
}

module.exports = {
  schema: true,
  autoPK: false,

  attributes: {
    id: {
      type: 'string',
      primaryKey: true
    },
    // 认证头衔
    title: {
      type: 'string',
      defaultsTo: ''
    },
    // 教练编号
    serialNumber: {
      type: 'string',
      defaultsTo: ''
    },
    // 服务区域
    regions: {
      type: 'json',
      defaultsTo: []
    },
    // 老家
    hometown: {
      type: 'string',
      defaultsTo: ''
    },
    // 语言
    languages: {
      type: 'json',
      defaultsTo: []
    },
    // 学历
    academic: {
      type: 'string',
      defaultsTo: ''
    },
    // 认证项目
    category: {
      type: 'json',
      defaultsTo: []
    },
    // 体征数据
    bodyData: {
      type: 'json',
      defaultsTo: {}
    },
    // 经历
    experience: {
      type: 'json',
      defaultsTo: []
    },
    // 证书
    certificate: {
      type: 'json',
      defaultsTo: []
    },
    // 训练项目
    cases: {
      type: 'json',
      defaultsTo: []
    },
    // 简介
    description: {
      type: 'text',
      defaultsTo: ''
    },
    // 评分
    rating: {
      type: 'float',
      defaultsTo: 0.0
    },
    idCardType: {
      type: 'string',
      defaultsTo: ''
    },
    idNumber: {
      type: 'string',
      defaultsTo: ''
    },
    // 是否推荐
    recommend: {
      type: 'boolean',
      defaultsTo: false
    },
    // 推荐排序
    displayOrder: {
      type: 'integer',
      defaultsTo: 100
    },
    // 学员总数
    trainees: {
      type: 'integer',
      defaultsTo: 0
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.id;
      delete obj.createdAt;
      delete obj.updatedAt;
      obj.regions = _.map(obj.regions, function(did) {
        return _.parseInt(did);
      });
      return obj;
    }
  },
  beforeCreate: function(values, next) {
    if (values.regions) {
      return convertRegions(values, next);
    } else {
      return next();
    }
  },
  beforeUpdate: function(values, next) {
    if (values.regions) {
      return convertRegions(values, next);
    } else {
      return next();
    }
  }
};
