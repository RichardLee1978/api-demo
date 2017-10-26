/**
* ActivityContestDetail.js
*
* @description :: 活动比赛详情
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
    // 序号
    index: {
      type: 'Integer',
      defaultsTo: 0
    },
    // 活动
    activity: {
      model: 'activity'
    },
    // 比赛分组
    section: {
      type: 'string',
      defaultsTo: ''
    },
    // 标题
    title: {
      type: 'string',
      defaultsTo: ''
    },
    // 价格
    price: {
      type: 'float',
      defaultsTo: 0
    },
    // 价格单位
    unit: {
      type: 'string',
      defaultsTo: ''
    },
    // 备注
    description: {
      type: 'string',
      defaultsTo: ''
    },
    // 限制条件
    conditions: {
      type: 'json',
      defaultsTo: {}
      /*
        // 最小人数
        minPeople: 1,
        // 最大人数
        maxPeople: 1,
        // 性别限制
        gender: [],
        // 年龄限制
        age: {
          // 比较符
          op: '',
          // 数值
          value: 0
        }
      */
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    // 报名限制
    limit: {
      type: 'Integer',
      defaultsTo: 0
    },
    // 已报名名额
    signed: {
      type: 'Integer',
      defaultsTo: 0
    }
  },
  beforeCreate: function(values, next) {
    next();
  },
  beforeUpdate: function(values, next) {
    next();
  }
};
