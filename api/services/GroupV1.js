'use strict';

/**
 * 社交圈列表
 * @param   {string}    category    按项目筛选
 * @param   {string}    search      搜索文本
 * @param   {integer}   skip        跳过记录数
 * @param   {function}  cb          回调函数
 * @return  {total, list}           总数、列表
 */
exports.groups = function(category, search, skip, cb) {
  var filterObj = {
    where: {
      enabled: true
    },
    limit: Constant.listLimit,
    skip: skip,
    sort: 'displayOrder'
  };
  if (category && category !== 'all') {
    filterObj.where.categories = {
      'contains': category
    };
  }
  if (search) {
    filterObj.where.name = {
      'contains': search
    };
  }
  async.auto({
    total: function totalFn(callback) {
      Group.count(filterObj.where).exec(callback);
    },
    list: function listFn(callback) {
      Group.find(filterObj).exec(callback);
    },
    process: ['list', function processFn(callback, result) {
      if (_.isEmpty(result.list)) {
        return callback(null, []);
      }

      var gcIds = _.uniq(_.pluck(result.list, 'createdBy'));
      User.withIds(gcIds, null, ['info'], function(_err, users) {
        if (_err) {
          return callback(_err);
        }

        async.map(result.list, function(group, innercb) {
          group.createdBy = users[group.createdBy];

          return innercb(null, group);
        }, callback);
      });
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
};

// TODO: add to controller
exports.createGroup = function(
  user, categories, name, desc, type, maxuser, isPublic, invite, approval, cb
) {
  async.auto({
    check: function checkFn(callback) {
      Group.count({
        name: name
      }).exec(function(err, count) {
        if (err) {
          return callback(err);
        }
        if (count) {
          return callback(Utils.error(400018));
        }
        return callback(null, true);
      });
    },
    easemob: ['check', function easemobFn(callback) {
      EaseMob.createGroup(
        name,
        desc,
        maxuser,
        isPublic,
        invite,
        approval,
        user.id,
        callback);
    }],
    group: ['easemob', function groupFn(callback) {
      Group.create({
        categories: categories,
        name: name,
        description: desc,
        type: type,
        isPublic: isPublic,
        maxUsers: maxuser,
        approval: approval,
        invite: invite,
        createdBy: user.id
      }).exec(callback);
    }],
    channel: ['group', function channelFn(callback, result) {
      Channel.create({
        id: result.easemob.groupid,
        createdBy: user.id,
        group: result.group.id,
        name: name,
        description: desc,
        isPublic: isPublic,
        maxUsers: maxuser,
        approval: approval,
        invite: invite
      }).exec(callback);
    }]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.group);
  });
};

/**
 * 保存用户创建的聊天频道
 * @param  {integer}    channelId   频道ID
 * @param  {string}     createdBy   创建人ID
 * @param  {string}     name        频道名
 * @param  {string}     description 描述
 * @param  {Boolean}    isPublic    是否公开频道
 * @param  {integer}    maxUsers    最大用户数
 * @param  {Boolean}    approval    是否需要批准进入
 * @param  {Boolean}    invite      是否允许邀请加入
 * @param  {Arrya}      members     群组成员
 * @param  {Function}   cb          回调函数
 */
exports.userCreatedChannel = function(channelId, createdBy, name, description,
          isPublic, maxUsers, approval, invite, members, cb) {
  async.auto({
    channel: function channelFn(callback) {
      Channel.create({
        id: channelId,
        createdBy: createdBy,
        group: '',
        name: name,
        description: description,
        isPublic: isPublic,
        maxUsers: maxUsers,
        approval: approval,
        invite: invite
      }).exec(function(err, result) {
        if (err) {
          return callback(err);
        }
        if (!_.isEmpty(result)) {
          return callback(null, {
            status: true
          });
        } else {
          return callback(null, {
            status: false
          });
        }
      });
    },
    members: [
      'channel',
      function membersFn(callback) {
        var memberArr = [];
        members.forEach(function(member) {
          memberArr.push({
            channel: channelId,
            user: member
          });
        });
        ChannelMember.create(memberArr).exec(callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.channel);
  });
};

/**
 * 更新用户自定义频道资料
 * @param  {string}   userId      当前用户ID
 * @param  {string}   channelId   频道ID
 * @param  {object}   channelInfo 频道信息
 * @param  {Function} cb          回调函数
 */
exports.updateUserChannel = function(userId, channelId, channelInfo, cb) {
  async.auto({
    check: function checkFn(callback) {
      Channel.checkOwner(userId, channelId, callback);
    },
    process: [
      'check',
      function processFn(callback) {
        Channel.update(channelId, channelInfo, function(err) {
          if (err) {
            return callback(err);
          }
          return callback(null, {
            status: true
          });
        });
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.process);
  });
};

/**
 * 解散用户自定义频道
 * @param  {string}   userId    当前用户ID
 * @param  {string}   channelId 频道ID
 * @param  {Function} cb        回调函数
 */
exports.dismissUserChannel = function(userId, channelId, cb) {
  async.auto({
    check: function checkFn(callback) {
      Channel.checkOwner(userId, channelId, callback);
    },
    process: [
      'check',
      function processFn(callback) {
        Channel.update(channelId, {
          enabled: false
        }).exec(function(err) {
          if (err) {
            return callback(err);
          }
          return callback(null, {
            status: true
          });
        });
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.process);
  });
};

/**
 * 管理员加人进入频道
 * @param {string}   userId    当前用户ID
 * @param {string}   channelId 频道ID
 * @param {string}   memberId  待添加的成员ID
 * @param {Function} cb        回调函数
 */
exports.addMemberToUserChannel = function(userId, channelId, memberId, cb) {
  async.auto({
    check: function checkFn(callback) {
      Channel.checkOwner(userId, channelId, callback);
    },
    process: [
      'check',
      function processFn(callback) {
        if (_.isArray(memberId)) {
          var memberArr = [];
          memberId.forEach(function(member) {
            memberArr.push({
              channel: channelId,
              user: member
            });
          });
          ChannelMember.create(memberArr).exec(function(err) {
            if (err) {
              return callback(err);
            }
            return callback(null, {
              status: true
            });
          });
        } else {
          var cmobj = {
            channel: channelId,
            user: memberId
          };
          ChannelMember.findOne(cmobj).exec(function(err, cm) {
            if (err) {
              return callback(err);
            }
            if (cm) {
              if (cm.enabled) {
                return callback(Utils.error(400024));
              } else {
                cm.enabled = true;
                cm.save(function(error) {
                  if (error) {
                    return callback(error);
                  }
                  return callback(null, {
                    status: true
                  });
                });
              }
            } else {
              ChannelMember.create(cmobj).exec(function(error) {
                if (error) {
                  return callback(error);
                }
                return callback(null, {
                  status: true
                });
              });
            }
          });
        }
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.process);
  });
};

/**
 * 管理员移除频道成员
 * @param {string}   userId    当前用户ID
 * @param {string}   channelId 频道ID
 * @param {string}   memberId  待添加的成员ID
 * @param {Function} cb        回调函数
 */
exports.removeMemberFromUserChannel = function(userId, channelId, memberId, cb) {
  async.auto({
    check: function checkFn(callback) {
      Channel.checkOwner(userId, channelId, callback);
    },
    process: [
      'check',
      function processFn(callback) {
        var cmobj = {
          channel: channelId,
          user: memberId
        };
        ChannelMember.findOne(cmobj).exec(function(err, cm) {
          if (err) {
            return callback(err);
          }
          if (!cm || (cm && cm.enabled === false)) {
            return callback(null, {
              message: 'not_channel_member'
            });
          } else if (cm && cm.enabled === true) {
            cm.enabled = false;
            cm.save(function(error) {
              if (error) {
                return callback(error);
              }
              return callback(null, {
                status: true
              });
            });
          }
        });
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.process);
  });
};

/**
 * 成员加入频道，自建频道默认允许用户邀请其他用户
 * @param {string}   userId    当前用户ID
 * @param {string}   channelId 频道ID
 * @param {string}   memberId  待添加的成员ID
 * @param {Function} cb        回调函数
 */
exports.inviteMemberToUserChannel = function(userId, channelId, memberId, cb) {
  async.auto({
    allowInvite: function allowInviteFn(callback) {
      Channel.findOne(channelId).exec(function(err, channel) {
        if (err) {
          return callback(err);
        }
        if (!channel.invite) {
          return callback(Utils.error(400002));
        }
        return callback(null, true);
      });
    },
    inviterIsMember: [
      'allowInvite',
      function inviterIsMemberFn(callback) {
        Channel.checkMember(userId, channelId, function(err, isMember) {
          if (err) {
            return callback(err);
          }
          if (!isMember) {
            return callback(Utils.error(400008));
          }
          return callback(null, true);
        });
      }
    ],
    process: [
      'inviterIsMember',
      function processFn(callback) {
        Channel.checkMember(memberId, channelId, true, function(err, member) {
          if (err) {
            return callback(err);
          }
          if (member && member.enabled) {
            return callback(Utils.error(400024));
          }
          if (!member) {
            ChannelMember.create({
              channel: channelId,
              user: memberId,
              inviter: userId,
              invitestatus: 'success'
            }).exec(function(_err) {
              if (_err) {
                return callback(_err);
              }
              return callback(null, {
                status: true
              });
            });
          } else {
            member.enabled = true;
            member.inviter = userId;
            member.invitestatus = 'success';
            member.save(function(error) {
              if (error) {
                return callback(error);
              }
              return callback(null, {
                status: true
              });
            });
          }
        });
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.process);
  });
};

/**
 * 成员退出频道
 * @param {string}   userId    当前用户ID
 * @param {string}   channelId 频道ID
 * @param {Function} cb        回调函数
 */
exports.memberLeaveChannel = function(userId, channelId, cb) {
  async.auto({
    member: function memberFn(callback) {
      Channel.checkMember(userId, channelId, true, function(err, member) {
        if (err) {
          return callback(err);
        }
        if (!member || (member && !member.enabled)) {
          return callback(Utils.error(400008));
        }
        return callback(null, member);
      });
    },
    process: [
      'member',
      function processFn(callback, result) {
        result.member.enabled = false;
        result.member.save(function(err) {
          if (err) {
            return callback(err);
          }
          return callback(null, {
            status: true
          });
        });
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.process);
  });
};

/**
 * 社交圈详情
 * @param   {string}        groupId     社交圈ID
 * @param   {string}        userId      当前用户ID
 * @param   {function}      cb          回调函数
 * @return  {Group}  社交圈对象
 */
exports.groupDetail = function(groupId, userId, cb) {
  async.auto({
    group: function groupFn(callback) {
      Group.findOne(groupId)
        .populate('members').exec(function(err, group) {
          if (err) {
            return callback(err);
          }
          if (!group) {
            return callback(Utils.error(400016));
          }
          group.members = [];
          return callback(null, group);
        });
    },
    createdBy: ['group', function createdByFn(callback, result) {
      User.withId(false, result.group.createdBy, null, ['info'], function(err, user) {
        if (err) {
          return callback(err);
        }
        return callback(null, user);
      });
    }],
    relation: [
      'group',
      function relationFn(callback) {
        GroupMember.findOne({
          group: groupId,
          member: userId
        }).exec(callback);
      }
    ],
    members: ['group', function membersFn(callback) {
      GroupMember.find({
        group: groupId,
        limit: Constant.listLimit,
        sort: 'createdAt asc'
      }).exec(function(err, members) {
        if (err) {
          return callback(err);
        }
        async.map(members, function(member, innercb) {
          User.withId(false, member.member, null, ['info', 'extra'],
            function(_err, user) {
              member.member = user;
              return innercb(_err, member);
            });
        }, function(error, results) {
          return callback(error, results);
        });
      });
    }]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }

    var group = results.group;
    var members = results.members;
    var relation = _.isEmpty(results.relation) ? '' :
      results.relation.status;

    group.members = members;
    group.createdBy = results.createdBy;
    return cb(null, {
      group: group,
      relation: relation
    });
  });
};

/**
 * 群组成员列表
 * @param {string}   groupId    群组ID
 * @param {integer}  skip       跳过记录数
 * @param {Function} cb         回调函数
 */
exports.groupMembers = function(userId, groupId, skip, cb) {
  var memberIds = [];
  async.auto({
    total: function totalFn(callback) {
      GroupMember.count({
        group: groupId,
        enabled: true
      }).exec(callback);
    },
    list: [
      'total',
      function listFn(callback, result) {
        if (!result.total) {
          return callback(null, []);
        }

        GroupMember.find({
          where: {
            group: groupId,
            enabled: true
          },
          limit: Constant.listLimit,
          skip: skip,
          sort: 'createdAt asc'
        }).exec(function(err, members) {
          if (err) {
            return callback(err);
          }
          async.map(members, function(member, innercb) {
            if (member.member !== userId) {
              memberIds.push(member.member);
            }
            User.withId(false, member.member, null, ['info', 'extra'],
              function(_err, user) {
                member.member = user;
                return innercb(_err, member);
              });
          }, function(_err, results) {
            return callback(_err, results);
          });
        });
      }
    ],
    memberRelation: [
      'list',
      function memberRelationFn(callback) {
        if (_.isEmpty(memberIds)) {
          return callback(null, []);
        }
        UserRelation.checkMultiRelation(userId, memberIds, callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results);
  });
};

/**
 * 返回用户的群组列表
 * @param {string}   userId     用户ID
 * @param {integer}  skip       跳过记录数字
 * @param {Function} cb         回调函数
 */
exports.userGroups = function(userId, type, skip, simple, cb) {
  if (simple) {
    return GroupV1.userSimpleGroups(userId, type, skip, cb);
  }
  var filterObj = {
    member: userId,
    enabled: true
  };
  if (type !== 'all') {
    filterObj.status = type;
  }
  async.auto({
    total: function totalFn(callback) {
      GroupMember.count(filterObj).exec(callback);
    },
    list: [
      'total',
      function listFn(callback, result) {
        if (!result.total) {
          return callback(null, []);
        }

        GroupMember.find({
          where: filterObj,
          limit: Constant.listLimit,
          skip: skip,
          sort: 'createdAt'
        }).populate('group').exec(callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results);
  });
};

/**
 * 返回用户的简单群组列表
 * @param {string}   userId     用户ID
 * @param {integer}  skip       跳过记录数字
 * @param {Function} cb         回调函数
 */
exports.userSimpleGroups = function(userId, type, skip, cb) {
  var filterObj = {
    member: userId,
    enabled: true
  };
  if (type !== 'all') {
    filterObj.status = type;
  }
  async.auto({
    total: function totalFn(callback) {
      GroupMember.count(filterObj).exec(callback);
    },
    list: [
      'total',
      function listFn(callback, result) {
        if (!result.total) {
          return callback(null, []);
        }

        GroupMember.find({
          where: filterObj,
          limit: Constant.listLimit,
          skip: skip,
          sort: 'createdAt'
        }).populate('group').exec(function(err, members) {
          if (err) {
            return callback(err);
          }
          members.forEach(function(member) {
            member.group = _.pick(_.clone(member.group), ['id', 'name', 'icon']);
          });
          return callback(null, members);
        });
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results);
  });
};

/**
 * 关注社交圈
 * @param   {string}      userId      当前用户ID
 * @param   {string}      groupId     社交圈ID
 * @param   {function}    cb          回调函数
 * @return  {boolean}     是否关注/取消关注成功
 */
exports.followGroup = function(userId, groupId, cb) {
  async.auto({
    group: function groupFn(callback) {
      Group.getOneById(groupId, callback);
    },
    check: [
      'group',
      function checkFn(callback) {
        // TODO: 有自定义群组以后需要加入各种验证判断
        GroupMember.findOne({
          group: groupId,
          member: userId
        }).exec(function(err, rec) {
          if (err) {
            return callback(err);
          }
          if (rec && rec.enabled === true) {
            return callback(null, 'already_in_group');
          }
          return callback(null, rec);
        });
      }
    ],
    process: [
      'check',
      function processFn(callback, result) {
        if (_.isString(result.check)) {
          return callback(null, null);
        }
        var obj = result.check;
        if (obj) {
          obj.enabled = true;
          obj.save(callback);
        } else {
          GroupMember.create({
            group: groupId,
            member: userId
          }).exec(callback);
        }
      }
    ],
    channel: [
      'process',
      function channelFn(callback, result) {
        if (_.isString(result.check)) {
          return callback(null, null);
        }
        EaseMob.joinGroup(userId, result.group.channel, function(err) {
          if (err) {
            return callback(err);
          }
          ChannelMember.findOrCreate({
            channel: result.group.channel,
            user: userId
          }).exec(function(error, cm) {
            if (error) {
              return callback(error);
            }
            if (cm.enabled === false) {
              cm.enabled = true;
              cm.save(callback);
            } else {
              return callback(null, null);
            }
          });
        });
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    if (results.check !== true) {
      return cb(null, {
        message: results.check
      });
    }
    return cb(null, {
      status: true
    });
  });
};

/**
 * 取消关注群组
 * @param  {string}   userId  当前用户ID
 * @param  {string}   groupId 群组ID
 * @param  {Function} cb      回调函数
 * @return {string|objec}     关注与否，所有者不能取消关注，取消关注成功
 */
exports.unfollowGroup = function(userId, groupId, cb) {
  async.auto({
    group: function groupFn(callback) {
      Group.getOneById(groupId, callback);
    },
    check: [
      'group',
      function checkFn(callback) {
        GroupMember.findOne({
          group: groupId,
          member: userId,
          enabled: true
        }).exec(function(err, rec) {
          if (err) {
            return callback(err);
          }
          if (rec) {
            if (rec.status === 'member') {
              return callback(null, rec);
            } else if (rec.status === 'owner') {
              return callback(null,
                'owner_cant_unfollow_before_transfer_ownership');
            }
          }
          return callback(null, 'did_not_follow');
        });
      }
    ],
    process: [
      'check',
      function processFn(callback, result) {
        if (_.isString(result.check)) {
          return callback(null, null);
        }
        result.check.enabled = false;
        result.check.save(callback);
      }
    ],
    channel: [
      'process',
      function channelFn(callback, result) {
        if (result.check !== true) {
          return callback(null, null);
        }
        EaseMob.leaveGroup(userId, result.group.channel, function(error) {
          if (error) {
            return callback(error);
          }
          ChannelMember.update({
            channel: result.group.channel,
            user: userId
          }, {
            enabled: false
          }).exec(callback);
        });
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    if (results.check !== true) {
      return cb(null, {
        message: results.check
      });
    }
    return cb(null, {
      status: true
    });
  });
};
