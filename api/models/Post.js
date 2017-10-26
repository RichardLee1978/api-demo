/**
 * Post.js
 *
 * @description :: 发帖类
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
    // 所属社交圈
    group: {
      type: 'string',
      defaultsTo: '*'
    },
    // 作者
    author: {
      model: 'user'
    },
    // 动态类型－系统发的或者用户发的
    type: {
      type: 'string',
      defaultsTo: 'user'
    },
    // 运动分类
    category: {
      type: 'string',
      defaultsTo: ''
    },
    // 所属场馆
    venue: {
      model: 'venue'
    },
    // 标题
    title: {
      type: 'string',
      defaultsTo: ''
    },
    // 内容
    content: {
      type: 'string',
      defaultsTo: ''
    },
    // 图片链接数组
    picture: {
      type: 'json',
      defaultsTo: []
    },
    // 视频链接
    video: {
      type: 'string',
      defaultsTo: ''
    },
    // 标签列表，逗号分割
    tags: {
      type: 'string',
      defaultsTo: ''
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    // 是否禁止回复
    disableComment: {
      type: 'boolean',
      defaultsTo: false
    },
    // 是否公开回复
    publicComment: {
      type: 'boolean',
      defaultsTo: true
    },
    // 排序
    displayOrder: {
      type: 'integer',
      defaultsTo: 100
    },
    // 是否推荐
    recommend: {
      type: 'boolean',
      defaultsTo: false
    },
    toJSON: function() {
      var obj = this.toObject();
      delete obj.updatedAt;
      return obj;
    }
  },
  afterCreate: function(record, next) {
    PostCount.create({
      post: record.id
    }).exec(next);
  },
  list: function(filterObj, cb) {
    async.auto({
      total: function totalFn(callback) {
        Post.count(filterObj.where).exec(callback);
      },
      list: [
        'total',
        function listFn(callback, result) {
          if (!result.total) {
            return callback(null, []);
          }
          Post.find(filterObj).exec(callback);
        }
      ],
      process: ['list', function processFn(callback, result) {
        if (!result.total) {
          return callback(null, []);
        }
        async.map(result.list, function(post, innercb) {
          async.auto({
            count: function countFn(icb) {
              PostCount.findOne({
                post: post.id
              }).exec(function(err, cObj) {
                if (err) {
                  return icb(err);
                }
                if (!cObj) {
                  return icb(null, {
                    likeCount: 0,
                    commentCount: 0
                  });
                }
                return icb(null, cObj);
              });
              return callback(null, result);
            },
            author: function authorFn(icb) {
              User.withId(false, post.author, null, ['info', 'extra'], function(err, user) {
                if (err) {
                  return icb(err);
                }
                return icb(null, user);
              });
            }
          }, function(err, results) {
            if (err) {
              return innercb(err);
            }
            post.likeCount = results.count.likeCount;
            post.commentCount = results.count.commentCount;
            post.author = results.author;
            return innercb(null, post);
          });
        }, callback);
      }]
    }, function(err, results) {
      if (err) {
        return cb(err);
      }
      return cb(null, {
        total: results.total,
        list: results.process
      });
    });
  }
};
