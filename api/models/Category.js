/**
 * Category.js
 *
 * @description :: 项目分类类
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
'use strict';

function updateCache(values, next) {
  GlobalData.update('categories', values, next);
}

module.exports = {
  schema: true,

  attributes: {
    name: 'string',
    // 语言翻译
    lang: {
      type: 'json',
      defaultsTo: []
    },
    // 显示顺序
    displayOrder: {
      type: 'integer',
      defaultsTo: 100
    },
    // 指定颜色
    color: 'string',
    // 容纳人数
    volume: {
      type: 'string',
      defaultsTo: ''
    },
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    toJSON: function() {
      var obj = this.toObject();
      delete obj.id;
      delete obj.displayOrder;
      delete obj.createdAt;
      delete obj.updatedAt;
      obj.color = obj.color.toUpperCase();
      return obj;
    }
  },
  afterCreate: function(values, next) {
    updateCache(values, next);
  },
  afterUpdate: function(values, next) {
    updateCache(values, next);
  }
};
