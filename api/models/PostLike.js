/**
 * PostLike.js
 *
 * @description :: 帖子点赞纪录类
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
    // 用户
    user: {
      model: 'user'
    }
  },
  afterCreate: function(record, next) {
    PostCount.findOrCreate({
      post: record.post
    }).exec(function(err, pcObj) {
      if (err) {
        return next(err);
      }
      pcObj.likeCount++;
      pcObj.save(next);
    });
  },
  afterDestroy: function(record, next) {
    PostCount.findOne({
      post: record.post
    }).exec(function(err, pcObj) {
      if (err) {
        return next(err);
      }
      pcObj.likeCount--;
      pcObj.save(next);
    });
  },
  byPost: function(postId, skip, cb) {
    var squel = require('squel').useFlavour('postgres');

    var q = squel.select({tableAliasQuoteCharacter: ''}).from('"userinfo"', '"ui"')
                  .from('"postlike"', '"pl"')
                  .field('ui.id')
                  .field('ui.avatar')
                  .where('ui.id = pl.user')
                  .where('pl.post = ?', postId)
                  .order('"pl"."createdAt"', false)
                  .limit(Constant.listLimit).offset(skip);

    async.auto({
      total: function totalFn(callback) {
        PostLike.count({
          post: postId
        }).exec(callback);
      },
      list: [
        'total',
        function listFn(callback, result) {
          if (!result.total) {
            return callback(null, []);
          }
          PostLike.query(q.toString(), function(err, results) {
            if (err) {
              return callback(err);
            }
            return callback(null, results.rows);
          });
        }
      ]
    }, function(err, results) {
      if (err) {
        return cb(err);
      }
      return cb(null, results);
    });
  }
};
