/**
* OrderWorkflowTask.js
*
* @description :: 订单工作流任务类
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
    // 订单ID
    order: {
      type: 'string',
      defaultsTo: ''
    },
    // 工作流ID
    workflow: {
      model: 'orderworkflow'
    },
    // 所有者
    owner: {
      type: 'string',
      defaultsTo: ''
    },
    // 承揽人
    contractor: {
      type: 'string',
      defaultsTo: ''
    },
    // 当前步骤
    currentStep: {
      type: 'integer',
      defaultsTo: 0
    },
    // 当前状态
    currentStatus: {
      type: 'string',
      defaultsTo: 'start'
    },
    // 当前付款状态
    currentPaymentStatus: {
      type: 'string',
      defaultsTo: 'start'
    }
  },
  afterCreate: function(record, next) {
    async.auto({
      workflow: function workflowFn(callback) {
        OrderWorkflow.findOne(record.workflow).populate('details', {
          index: 0,
          limit: 1
        }).exec(callback);
      },
      entry: [
        'workflow',
        function entryFn(callback, result) {
          var role = result.workflow.details[0].operator;
          role = _.invert(result.workflow)[role];
          OrderWorkflowTaskEntry.create({
            task: record.id,
            operator: record[role],
            step: result.workflow.details[0].id
          }).exec(callback);
        }
      ],
      updaterecord: [
        'workflow',
        function updaterecordFn(callback, result) {
          OrderWorkflowTask.update(record.id, {
            currentStep: result.workflow.details[0].id,
            currentStatus: result.workflow.details[0].status,
            currentPaymentStatus: result.workflow.details[0].paymentStatus
          }).exec(callback);
        }
      ]
    }, function(err) {
      if (err) {
        return next(err);
      }
      return next();
    });
  },
  afterUpdate: function(values, next) {
    if (!values.currentPaymentStatus || !values.currentStatus) {
      return next();
    }
    OrderWorkflowTask.findOne(values.id).populate('workflow').exec(function(err, record) {
      if (err) {
        return next(err);
      }
      sails.models[record.workflow.type].findOne(record.order).exec(function(error, order) {
        if (error) {
          return next(error);
        }
        if (values.currentPaymentStatus) {
          order.paidStatus = values.currentPaymentStatus;
        }
        if (values.currentStatus) {
          order.orderStatus = values.currentStatus;
        }
        order.save(next);
      });
    });
  }
};
