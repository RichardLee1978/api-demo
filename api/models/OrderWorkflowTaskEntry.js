/**
* OrderWorkflowTaskEntry.js
*
* @description :: 订单工作流任务实体类
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
    task: {
      model: 'orderworkflowtask'
    },
    operator: {
      model: 'user'
    },
    step: {
      model: 'orderworkflowdetail'
    }
  }
};
