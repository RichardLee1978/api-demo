'use strict';

module.exports = {
  /**
   * 开始订单任务
   * @param  {string}   type    订单类别 sportsorder|coachorder
   * @param  {obect}    order   订单对象
   */
  begin: function(type, order, cb) {
    async.auto({
      workflow: function workflowFn(callback) {
        OrderWorkflow.findOne({
          type: type,
          enabled: true
        }).populate('details').exec(callback);
      },
      task: [
        'workflow',
        function taskFn(callback, result) {
          OrderWorkflowTask.create({
            workflow: result.workflow.id,
            order: order.id,
            owner: order[result.workflow.owner],
            contractor: order[result.workflow.contractor]
          }).exec(callback);
        }
      ],
      methods: [
        'task',
        function methodsFn(callback) {
          OrderTaskV1.nextSteps(order.id, order.user, callback);
        }
      ]
    }, function(err, results) {
      if (err) {
        return cb(err);
      }
      return cb(null, results.methods);
    });
  },

  /**
   * 订单任务处理
   * @param  {string}     userId  当前用户ID
   * @param  {string}     orderId 订单ID
   * @param  {integer}    stepId  当前步骤ID
   */
  process: function(userId, orderId, stepId, cb) {
    async.auto({
      task: function taskFn(callback) {
        OrderWorkflowTask.findOne({
          order: orderId,
          or: [{
            owner: userId
          }, {
            contractor: userId
          }]
        }).populate('workflow').exec(function(err, task) {
          if (err) {
            return callback(err);
          }
          if (!task) {
            return callback(Utils.error(400006));
          }
          return callback(null, task);
        });
      },
      assureOrder: [
        'task',
        function assureOrderFn(callback) {
          OrderWorkflowDetail.findOne(stepId).exec(function(err, detail) {
            if (err) {
              return callback(err);
            }

            if (!detail) {
              return callback(Utils.error(400020));
            }

            return callback(null, null);
          });
        }
      ],
      check: [
        'assureOrder',
        function checkFn(callback, result) {
          var role = _.invert(result.task)[userId];
          OrderWorkflowDetail.count({
            id: stepId,
            operator: result.task.workflow[role]
          }).exec(function(err, count) {
            if (err) {
              return callback(err);
            }
            if (!count) {
              return callback(Utils.error(400009));
            }
            return callback(null, null);
          });
        }
      ],
      completeEntry: [
        'check',
        function completeEntryFn(callback, result) {
          OrderWorkflowTaskEntry.create({
            task: result.task.id,
            operator: userId,
            step: stepId
          }).exec(callback);
        }
      ],
      updateTask: [
        'completeEntry',
        function updateTaskFn(callback, result) {
          OrderWorkflowDetail.findOne(stepId).exec(function(err, detail) {
            if (err) {
              return callback(err);
            }
            result.task.currentStep = detail.id;
            result.task.currentStatus = detail.status;
            result.task.currentPaymentStatus = detail.paymentStatus;
            result.task.save(callback);
          });
        }
      ]
    }, function(err) {
      if (err) {
        return cb(err);
      }
      return cb(null, {
        status: true
      });
    });
  },

  /**
   * 获取单个订单的下一步操作
   * @param  {string}   orderId 订单ID
   * @param  {string}   userId  当前用户ID
   */
  nextSteps: function(orderId, userId, cb) {
    if (!_.isString(orderId) || _.isEmpty(orderId)) {
      return cb(Utils.error('bad nextSteps argument'));
    }
    async.auto({
      task: function taskFn(callback) {
        OrderWorkflowTask.findOne({
          order: orderId
        }).populate('workflow').exec(callback);
      },
      role: [
        'task',
        function roleFn(callback, result) {
          var role = _.invert(result.task)[userId];
          return callback(null, role);
        }
      ],
      nextWithCurrentStep: [
        'task',
        function nextWithCurrentStepFn(callback, result) {
          OrderWorkflowDetail.findOne(result.task.currentStep).exec(function(err, detail) {
            if (err) {
              return callback(err);
            }
            OrderWorkflowDetail.findOne(detail.to).exec(callback);
          });
        }
      ],
      steps: [
        'role',
        'nextWithCurrentStep',
        function stepsFn(callback, result) {
          OrderWorkflowDetail.find({
            workflow: result.task.workflow.id,
            index: result.nextWithCurrentStep ?
              result.nextWithCurrentStep.index : 99,
            operator: result.task.workflow[result.role]
          }).sort('displayOrder').exec(function(err, details) {
            if (err) {
              return callback(err);
            }
            var methods = [];
            _.each(details, function(detail) {
              methods.push(_.pick(detail, function(value, key) {
                var keys = ['id', 'method', 'name', 'confirm', 'requirements'];
                return _.contains(keys, key);
              }));
            });
            return callback(null, methods);
          });
        }
      ]
    }, function(err, results) {
      if (err) {
        return cb(err);
      }
      return cb(null, results.steps);
    });
  },

  /**
   * 获取多个订单的下一步操作
   * @param  {array}    orderIds  订单ID数组
   * @param  {string}   userId    当前用户ID
   */
  nextStepsWithOrders: function(orderIds, userId, cb) {
    if (!_.isArray(orderIds)) {
      return cb(Utils.error('bad nextStepsWithOrders argument'));
    }
    if (_.isEmpty(orderIds)) {
      return cb(null, {});
    }
    async.auto({
      tasks: function tasks(callback) {
        OrderWorkflowTask.find({
          order: orderIds
        }).exec(callback);
      },
      workflows: [
        'tasks',
        function workflowsFn(callback, result) {
          var wfids = _.chain(result.tasks).pluck('workflow').uniq().value();
          OrderWorkflow.find(wfids).exec(function(err, results) {
            if (err) {
              return callback(err);
            }
            return callback(null, _.indexBy(results, 'id'));
          });
        }
      ],
      roles: [
        'tasks',
        'workflows',
        function rolesFn(callback, result) {
          async.map(result.tasks, function(task, mapcb) {
            try {
              var obj = {
                order: task.order,
                workflow: task.workflow,
                currentStep: task.currentStep
              };
              var workflow = result.workflows[task.workflow];
              var role = _.invert(task)[userId];
              obj.role = workflow[role];

              OrderWorkflowDetail.findOne(obj.currentStep).exec(function(err, detail) {
                if (err) {
                  return mapcb(err);
                }
                OrderWorkflowDetail.findOne(detail.to).exec(function(_err, todetail) {
                  if (_err) {
                    return mapcb(_err);
                  }
                  if (!todetail) {
                    obj.index = 99;
                  } else {
                    obj.index = todetail.index;
                  }
                  return mapcb(null, obj);
                });
              });
            } catch (e) {
              return mapcb(e);
            }
          }, function(err, mapresult) {
            if (err) {
              return callback(err);
            }
            return callback(null, mapresult);
          });
        }
      ],
      steps: [
        'roles',
        function stepsFn(callback, result) {
          async.map(result.roles, function(roleobj, mapcb) {
            OrderWorkflowDetail.find({
              workflow: roleobj.workflow,
              index: roleobj.index,
              operator: roleobj.role
            }).sort('displayOrder').exec(function(err, details) {
              if (err) {
                return mapcb(err);
              }
              var methods = [];
              _.each(details, function(detail) {
                methods.push(_.pick(detail, function(value, key) {
                  var keys = ['id', 'method', 'name', 'confirm', 'requirements'];
                  return _.contains(keys, key);
                }));
              });
              return mapcb(null, {
                order: roleobj.order,
                methods: methods
              });
            });
          }, function(err, stepObj) {
            if (err) {
              return callback(err);
            }
            return callback(null, stepObj);
          });
        }
      ]
    }, function(err, results) {
      if (err) {
        return cb(err);
      }
      return cb(null, results.steps);
    });
  },

  checkStepRequirementFields: function(stepId, orderInfo, cb) {
    async.auto({
      detail: function detailFn(callback) {
        OrderWorkflowDetail.findOne(stepId).exec(function(err, detail) {
          if (err) {
            return callback(err);
          }
          if (!detail) {
            return callback(Utils.error(400001));
          }
          return callback(null, detail);
        });
      },
      check: [
        'detail',
        function checkFn(callback, result) {
          if (_.isEmpty(result.detail.requirements)) {
            return callback(null, null);
          }
          var keys = _.keys(orderInfo);
          _.each(result.detail.requirements, function(requireObj) {
            if (requireObj.field.length === 1) {
              if (!_.contains(keys, requireObj.field[0])) {
                return callback(Utils.error(400001));
              }
            } else {
              var diff = _.difference(requireObj.field, keys);
              if (diff.length === requireObj.field.length) {
                return callback(Utils.error(400001));
              }
            }
          });
          return callback(null, null);
        }
      ]
    }, function(err) {
      if (err) {
        return cb(err);
      }
      return cb(null, null);
    });
  }
};
