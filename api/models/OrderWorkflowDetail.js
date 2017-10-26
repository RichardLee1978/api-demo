/**
* OrderWorkflowDetail.js
*
* @description :: 订单工作流详情类
* @docs        :: http://sailsjs.org/#!documentation/models
*/
'use strict';

module.exports = {
  schema: true,

  attributes: {
    // 工作流
    workflow: {
      model: 'orderworkflow'
    },
    // 索引
    index: {
      type: 'integer',
      defaultsTo: 0
    },
    // 上一步
    from: {
      type: 'integer',
      defaultsTo: 0
    },
    // 下一步
    to: {
      type: 'integer',
      defaultsTo: 0
    },
    // 排序
    displayOrder: {
      type: 'integer',
      defaultsTo: 100
    },
    // 操作
    method: {
      type: 'string',
      defaultsTo: ''
    },
    // 操作名－显示在按钮上
    name: {
      type: 'jsonb',
      defaultsTo: []
    },
    // 操作描述
    description: {
      type: 'string',
      defaultsTo: ''
    },
    // 操作者
    operator: {
      type: 'string',
      defaultsTo: ''
    },
    // 状态描述
    status: {
      type: 'string',
      defaultsTo: ''
    },
    // 支付状态描述
    paymentStatus: {
      type: 'string',
      defaultsTo: ''
    },
    // 通知设置
    notify: {
      type: 'json',
      defaultsTo: {
        owner: {
          sms: false,
          notification: false
        },
        contractor: {
          sms: false,
          notification: false
        }
      }
    },
    confirm: {
      type: 'json',
      defaultsTo: []
    },
    requirements: {
      type: 'json',
      defaultsTo: []
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.createdAt;
      delete obj.updatedAt;
      return obj;
    }
  }
};
