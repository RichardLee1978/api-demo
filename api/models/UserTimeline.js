/**
 * UserTimeline.js
 *
 * @description :: 用户时间线类
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
    // 用户
    user: {
      model: 'user'
    },
    // 类型
    type: {
      type: 'string',
      defaultsTo: '' // TODO: add defaults type, complete type define
      // post,status,addfriend,order,coach,activity
    },
    // 内容
    content: {
      type: 'json',
      defaultsTo: {}
    },
    // 可见性
    visible: {
      type: 'string',
      defaultsTo: 'public' // TODO: 可见：public,friend,owner,specific
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    // 是否模版需要被解析
    isTemplate: {
      type: 'boolean',
      defaultsTo: false
    },
    toJSON: function() {
      var obj = this.toObject();
      delete obj.updatedAt;
      delete obj.user;
      delete obj.enabled;
      return obj;
    }
  },
  becomeFriendsCheck: function(userId, followId, cb) {
    async.auto({
      hasHistory: function hasHistoryFn(callback) {
        var squel = require('squel').useFlavour('postgres');

        var v = squel.select({
          tableAliasQuoteCharacter: '"',
          nameQuoteCharacter: '"',
          autoQuoteTableNames: true
        });

        v.from('usertimeline', 'tl')
          .where('tl."user" = ?', userId)
          .where('tl."type" = ?', 'becomefriends')
          .where(`(tl.content::jsonb)#>'{data,user}' ?| array['${followId}']`)
          .field('count(*)', 'cnt');

        UserTimeline.query(v.toString(), function(err, result) {
          if (err) {
            return callback(err);
          }
          result = result.rows.pop();
          return callback(null, +(result.cnt) > 0);
        });
      },
      last: [
        'hasHistory',
        function lastFn(callback, result) {
          if (result.hasHistory) {
            return callback(null, {});
          }
          var moment = require('moment');
          UserTimeline.findOne({
            where: {
              user: userId,
              type: 'becomefriends',
              createdAt: {
                '<': moment().subtract(2, 'hours').toDate()
              }
            },
            sort: 'createdAt desc'
          }).exec(callback);
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
