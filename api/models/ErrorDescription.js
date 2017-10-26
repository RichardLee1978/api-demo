/**
 * ErrorDescription.js
 *
 * @description :: 错误描述类
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
'use strict';

function updateCache(values, next) {
  GlobalData.update('errorDescription', values, next);
}

module.exports = {
  schema: true,
  autoPK: false,

  attributes: {
    id: {
      type: 'string',
      primaryKey: true
    },
    // http status code
    type: 'integer',
    // http error code
    code: 'integer',
    // 错误键值，返回给客户端
    error: {
      type: 'json',
      defaultsTo: []
    },
    // 错误描述，对应键值的解读
    description: 'string'
  },
  afterCreate: function(values, next) {
    updateCache(values, next);
  },
  afterUpdate: function(values, next) {
    updateCache(values, next);
  }
};
