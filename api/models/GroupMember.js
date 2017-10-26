/**
 * GroupMember.js
 *
 * @description :: 社交圈成员类
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
    // 社交圈
    group: {
      model: 'group'
    },
    // 成员
    member: {
      model: 'user'
    },
    status: {
      type: 'string',
      defaultsTo: 'member',
      enum: ['owner', 'member']
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    toJSON: function() {
      var obj = this.toObject();
      delete obj.createdAt;
      delete obj.updatedAt;
      delete obj.enabled;
      delete obj.id;
      if (_.isString(obj.group)) {
        delete obj.group;
      }
      if (_.isString(obj.member)) {
        delete obj.member;
      }
      return obj;
    }
  },
  afterCreate: function(record, next) {
    async.auto({
      group: function grouFn(callback) {
        Group.findOne(record.group).exec(function(err, group) {
          if (err) {
            return callback(err);
          }
          group.memberCount += 1;
          group.save(callback);
        });
      },
      user: function userFn(callback) {
        UserExtra.findOne(record.member).exec(function(err, member) {
          if (err) {
            return callback(err);
          }
          member.groups += 1;
          member.save(callback);
        });
      }
    }, next);
  },
  afterUpdate: function(record, next) {
    if (!record.enabled) {
      async.auto({
        group: function grouFn(callback) {
          Group.findOne(record.group).exec(function(err, group) {
            if (err) {
              return callback(err);
            }
            group.memberCount -= 1;
            group.save(callback);
          });
        },
        user: function userFn(callback) {
          UserExtra.findOne(record.member).exec(function(err, member) {
            if (err) {
              return callback(err);
            }
            member.groups -= 1;
            member.save(callback);
          });
        }
      }, next);
    } else {
      return next();
    }
  }
};
