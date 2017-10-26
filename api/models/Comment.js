/**
 * Comment.js
 *
 * @description :: 回复类
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
    // 帖子
    post: {
      model: 'post'
    },
    // 楼层
    floor: {
      type: 'integer',
      defaultsTo: 1
    },
    // 回复楼层
    to: {
      type: 'integer',
      defaultsTo: 0
    },
    // 用户
    author: {
      model: 'user'
    },
    // 内容
    content: 'string',
    // 是否屏蔽
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    toJSON: function() {
      var obj = this.toObject();
      delete obj.updatedAt;
      return obj;
    }
  },
  beforeCreate: function(values, next) {
    Comment.count({
      post: values.post
    }).exec(function(err, count) {
      if (err) {
        return next(err);
      }
      if (!count) {
        return next();
      }
      values.floor = count + 1;

      next();
    });
  },
  afterCreate: function(record, next) {
    PostCount.findOrCreate({
      post: record.post
    }).exec(function(err, pcObj) {
      if (err) {
        return next(err);
      }
      pcObj.commentCount++;
      pcObj.save(next);
    });
  }
};
