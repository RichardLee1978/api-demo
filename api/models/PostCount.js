/**
* PostCount.js
*
* @description :: 动态计数类
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  connection: 'redis',
  schema: true,

  attributes: {
    post: {
      model: 'post'
    },
    // 点赞总数
    likeCount: {
      type: 'integer',
      defaultsTo: 0
    },
    // 评论总数
    commentCount: {
      type: 'integer',
      defaultsTo: 0
    },
    hotCount: {
      type: 'integer',
      defaultsTo: 0
    }
  },
  beforeCreate: function(values, next) {
    next();
  },
  beforeUpdate: function(values, next) {
    values.hotCount = values.likeCount + values.commentCount;
    next();
  }
};
