/**
 * Tag.js
 *
 * @description :: 标签类
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
'use strict';

module.exports = {
  autoPK: false,
  schema: true,

  attributes: {
    id: {
      type: 'string',
      primaryKey: true
    },
    title: {
      type: 'string',
      defaultsTo: ''
    },
    type: {
      type: 'string',
      defaultsTo: 'post'
    },
    createdBy: {
      model: 'user'
    },
    // 是否推荐
    recommend: {
      type: 'boolean',
      defaultsTo: false
    },
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    toJSON: function() {
      var obj = this.toObject();
      delete obj.createdAt;
      delete obj.updatedAt;
      delete obj.createdBy;
      return obj;
    }
  }
};
