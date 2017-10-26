/**
 * UserRelation.js
 *
 * @description :: 用户关系表
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
    // 朋友
    // [{id:'',source:''}]
    friends: {
      type: 'json',
      defaultsTo: []
    },
    // 粉丝
    // [{id:'',source:''}]
    fans: {
      type: 'json',
      defaultsTo: []
    },
    // 玩伴
    // [{id:'',source:''}]
    playmates: {
      type: 'json',
      defaultsTo: []
    },
    // 黑名单
    // [id,...]
    blocks: {
      type: 'json',
      defaultsTo: []
    }
  },

  afterUpdate: function(record, cb) {
    var obj = {};
    if (record.friends) {
      obj.friends = _.size(record.friends);
    }
    if (record.fans) {
      obj.fans = _.size(record.fans);
    }
    if (record.playmates) {
      obj.playmates = _.size(record.playmates);
    }

    if (_.isEmpty(obj)) {
      return cb();
    }

    UserExtra.update(record.id, obj).exec(cb);
  },

  checkRelation: function(userId, otherUser, callback) {
    if (userId === otherUser) {
      return callback(null, {
        isFriend: false,
        isFan: false,
        blockWithMe: false,
        blockMe: false,
        favorited: false
      });
    }
    var squel = require('squel').useFlavour('postgres');

    var q = squel.select({
      tableAliasQuoteCharacter: ''
    }).from('"userrelation"', '"ur1"')
    .from('"userrelation"', '"ur2"')
    .from('"userfavorite"', '"uf"')
    .where('"ur1"."id" = ?', userId)
    .where('"ur2"."id" = ?', otherUser)
    .where('"uf"."id" = ?', userId);

    q.field(`"ur1"."friends" @> '[{"id":"${otherUser}"}]'`, 'isFriend')
      .field(`"ur2"."fans" @> '[{"id":"${userId}"}]'`, 'isFan')
      .field(`"ur1"."blocks" ?| array['${otherUser}']`, 'blockWithMe')
      .field(`"ur2"."blocks" ?| array['${userId}']`, 'blockMe')
      .field(`"uf"."users" @> '[{"id":"${otherUser}"}]'`, 'favorited');

    UserRelation.query(q.toString(), function(err, results) {
      if (err) {
        return callback(err);
      }
      if (_.isEmpty(results.rows)) {
        return callback(null, {
          isFriend: false,
          isFan: false,
          blockWithMe: false,
          blockMe: false,
          favorited: false
        });
      }
      return callback(null, results.rows[0]);
    });
  },
  checkMultiRelation: function(userId, otherUsers, callback) {
    var squel = require('squel').useFlavour('postgres');

    async.map(otherUsers, function(otherUser, innercb) {
      var q = squel.select({
        tableAliasQuoteCharacter: ''
      }).from('"userrelation"', '"ur1"')
      .from('"userrelation"', '"ur2"')
      .from('"userfavorite"', '"uf"')
      .where('"ur1"."id" = ?', userId)
      .where('"ur2"."id" = ?', otherUser)
      .where('"uf"."id" = ?', userId);

      q.field(`'${otherUser}'`, 'id')
        .field(`"ur1"."friends" @> '[{"id":"${otherUser}"}]'`, 'isFriend')
        .field(`"ur2"."fans" @> '[{"id":"${userId}"}]'`, 'isFan')
        .field(`"ur1"."blocks" ?| array['${otherUser}']`, 'blockWithMe')
        .field(`"ur2"."blocks" ?| array['${userId}']`, 'blockMe')
        .field(`"uf"."users" @> '[{"id":"${otherUser}"}]'`, 'favorited');

      UserRelation.query(q.toString(), function(err, results) {
        if (err) {
          return innercb(err);
        }
        return innercb(null, results.rows[0]);
      });
    }, function(error, relations) {
      if (error) {
        return callback(error);
      }
      return callback(null, relations);
    });
  }
};
