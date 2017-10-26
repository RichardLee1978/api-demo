/**
 * Channel.js
 *
 * @description :: 聊天频道类
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
    // 创建人
    createdBy: {
      model: 'user'
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    // 对应群组
    group: {
      model: 'group'
    },
    // 名称
    name: 'string',
    // 描述
    description: 'text',
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
    toJSON: function() {
      var obj = this.toObject();
      delete obj.createdAt;
      delete obj.updatedAt;
      delete obj.enabled;
      return obj;
    }
  },
  afterCreate: function(record, next) {
    async.auto({
      group: function groupFn(callback) {
        if (record.group) {
          Group.update(record.group, {
            channel: record.id
          }).exec(callback);
        } else {
          return callback(null, null);
        }
      },
      member: function memberFn(callback) {
        ChannelMember.create({
          channel: record.id,
          user: record.createdBy
        }).exec(callback);
      }
    }, function() {
      return next();
    });
  },
  checkOwner: function(userId, channelId, next) {
    Channel.findOne(channelId).exec(function(err, channel) {
      if (err) {
        return next(err);
      }
      if (!channel) {
        return next(Utils.error(400003));
      }
      if (channel.createdBy !== userId) {
        return next(Utils.error(400010));
      }
      return next(null, true);
    });
  },
  checkMember: function(userId, channelId, needObj, next) {
    if (_.isFunction(needObj)) {
      next = needObj;
      needObj = false;
    }
    ChannelMember.findOne({
      channel: channelId,
      user: userId
    }).exec(function(err, result) {
      if (err) {
        return next(err);
      }
      if (result) {
        if (needObj) {
          return result;
        } else {
          return result.enabled;
        }
      } else {
        return next(null, false);
      }
    });
  }
};
