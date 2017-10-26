/**
 * UserFavorite.js
 *
 * @description :: 用户收藏信息类
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
    // 场馆
    venues: {
      type: 'json',
      defaultsTo: []
    },
    // 动态
    posts: {
      type: 'json',
      defaultsTo: []
    },
    // 用户
    users: {
      type: 'json',
      defaultsTo: []
    },
    // 活动
    activities: {
      type: 'json',
      defaultsTo: []
    }
  },
  userInFavorite: function(userId, callback) {
    var squel = require('squel').useFlavour('postgres');

    var q = squel.select({
      tableAliasQuoteCharacter: ''
    }).from('"userfavorite"', '"uf"');
    q.field('count(*)', 'count');
    q.where(`"uf"."users" @> '[{"id":"${userId}"}]'`);

    UserFavorite.query(q.toString(), function(err, results) {
      if (err) {
        return callback(err);
      }
      return callback(null, +(results.rows[0].count));
    });
  }
};
