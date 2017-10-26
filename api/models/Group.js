/**
 * Group.js
 *
 * @description :: 社交圈类
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
    // 项目
    categories: 'string',
    // 名称
    name: 'string',
    // 描述
    description: {
      type: 'string',
      defaultsTo: ''
    },
    // 公告
    notice: {
      type: 'string',
      defaultsTo: ''
    },
    // 图标
    icon: {
      type: 'string',
      defaultsTo: ''
    },
    // 类型 自建，系统
    type: 'string',
    // 创建人
    createdBy: {
      model: 'user'
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    // 排序
    displayOrder: {
      type: 'integer',
      defaultsTo: 100
    },
    // 群组人数
    memberCount: {
      type: 'integer',
      defaultsTo: 1
    },
    // 是否公开
    isPublic: {
      type: 'boolean',
      defaultsTo: true
    },
    // 最大成员数
    maxUsers: {
      type: 'integer',
      defaultsTo: 500
    },
    // 加入是否需要批准，后期不能修改
    approval: {
      type: 'boolean',
      defaultsTo: false
    },
    // 是否开放邀请
    invite: {
      type: 'boolean',
      defaultsTo: false
    },
    // 是否推荐
    recommend: {
      type: 'boolean',
      defaultsTo: false
    },
    // 聊天频道
    // TODO: 聊天频道和群组是否一对一
    channel: {
      model: 'channel'
    },
    // 群组成员
    members: {
      collection: 'groupmember',
      via: 'group'
    },
    // 标签列表，逗号分割
    tags: {
      type: 'string',
      defaultsTo: ''
    },
    toJSON: function() {
      var obj = this.toObject();
      delete obj.createdAt;
      delete obj.updatedAt;
      delete obj.displayOrder;
      delete obj.enabled;
      // FIXME: 检查为什么会被调用两次，在获取 usergroups 的时候
      if (!_.isArray(obj.categories)) {
        obj.categories =
          _.indexOf(obj.categories, ',') !== -1 ? obj.categories.split(',') : [
            obj.categories
          ];
      }
      return obj;
    }
  },
  afterCreate: function(record, next) {
    GroupMember.create({
      group: record.id,
      member: record.createdBy,
      status: 'owner'
    }).exec(next);
  },
  listPublicAndUserGroupIds: function listPublicAndUserGroupIdsFn(userId, cb) {
    var needUserGroups = true;
    if (_.isNull(userId)) {
      needUserGroups = false;
    }
    async.auto({
      usergroups: function usergroupsFn(callback) {
        if (!needUserGroups) {
          return callback(null, []);
        }
        GroupMember.find({
          member: userId,
          enabled: true
        }).exec(function(err, result) {
          if (err) {
            return callback(err);
          }
          var ids = _.pluck(result, 'group');
          return callback(null, ids);
        });
      },
      groups: function groupsFn(callback) {
        Group.find({
          enabled: true,
          isPublic: true
        }).exec(function(err, result) {
          if (err) {
            return callback(err);
          }
          var ids = _.pluck(result, 'id');
          return callback(null, ids);
        });
      }
    }, function(err, results) {
      if (err) {
        return cb(err);
      }
      var ids = _.union(results.usergroups, results.groups);
      return cb(null, ids);
    });
  },
  listUserGroupIds: function listUserGroupIdsFn(userId, cb) {
    GroupMember.find({
      member: userId,
      enabled: true
    }).exec(function(err, result) {
      if (err) {
        return cb(err);
      }
      var ids = _.pluck(result, 'group');
      return cb(null, ids);
    });
  },
  getOneById: function getOneByIdFn(groupId, callback) {
    Group.findOne(groupId).exec(function(err, group) {
      if (err) {
        return callback(err);
      }
      if (!group) {
        return callback(Utils.error(400016));
      }
      if (!group.enabled) {
        return callback(Utils.error(400017));
      }
      return callback(null, group);
    });
  }
};
