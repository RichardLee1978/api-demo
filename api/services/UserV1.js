'use strict';

var moment = require('moment'),
  squel = require('squel').useFlavour('postgres');

/**
 * 检查用户名是否存在
 * @param  {string}   username 用户名
 */
exports.checkUserNameExists = function(username, callback) {
  User.countByUsername(username).exec(function(err, count) {
    if (err) {
      return callback(err);
    }
    if (count === 0) {
      return callback(null, false);
    }
    return callback(null, true);
  });
};

/**
 * 发送短信验证码
 * @param {string}   type     发送类型
 * @param {string}   phone    手机号
 * @param {Client}   client   当前请求客户端
 * @param {Function} cb       回调函数
 * @return {string}   验证码与clientSecret用aes192加密后的字符串，用来客户端校验
 * @error 用户已存在
 *        及其它可能产生的网络错误
 */
exports.verificationCode = function(type, phone, client, ip, cb) {
  var expireObj = moment().add(Constant.smsTimeLimit, 's');
  async.auto({
    phoneNotExists: function phoneNotExistsFn(callback) {
      if (!_.contains(['forget'], type)) {
        return callback(null, false);
      }
      User.countByUsername(phone).exec(function(err, count) {
        if (err) {
          return callback(err);
        }
        if (count === 0) {
          return callback(Utils.error(400038));
        }
        return callback(null, false);
      });
    },
    phoneExists: function phoneExistsFn(callback) {
      if (!_.contains(['register'], type)) {
        return callback(null, false);
      }
      User.countByUsername(phone).exec(function(err, count) {
        if (err) {
          return callback(err);
        }
        if (count > 0) {
          return callback(Utils.error(400039));
        }
        return callback(null, false);
      });
    },
    verifyCoach: function verifyCoachFn(callback) {
      if (!_.contains(['coachLogin'], type)) {
        return callback(null, false);
      }
      User.findOneByUsername(phone).exec(function(err, user) {
        if (err) {
          return callback(err);
        }
        if (!user) {
          return callback(Utils.error(400038));
        }
        if (!user.verifyCoach) {
          return callback(Utils.error(400007));
        }
        return callback(null, false);
      });
    },
    code: [
      'phoneExists',
      'phoneNotExists',
      'verifyCoach',
      function codeFn(callback) {
        var verificationCode = `${Utils.randomCode(4)}`;
        VerificationCode.create({
          phone: phone,
          code: verificationCode,
          type: type,
          expire: expireObj.toDate()
        }).exec(function(err) {
          if (err) {
            return callback(err);
          }
          return callback(null, verificationCode);
        });
      }
    ],
    sendCode: [
      'code',
      function sendCodeFn(callback, result) {
        var content = '';
        switch (type) {
          case 'coachLogin':
            content = `登录验证码为: ${result.code}， 验证码有效时间为一分钟。`;
            break;
          case 'register':
            content = `注册验证码为: ${result.code}。`;
            break;
          default:
            content = `验证码为: ${result.code}。`;
        }
        SMS.send(type, phone, content, callback);
      }
    ],
    returnCode: [
      'sendCode',
      function returnCodeFn(callback, result) {
        var code = Utils.encrypt(`${result.code}|${expireObj.unix()}`, client.clientSecret);
        return callback(null, code);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.returnCode);
  });
};

/**
 * 账号注册
 * @param {string}   username 用户名，即手机号
 * @param {string}   password 密码
 * @param {string}   nickname 昵称
 * @param {string}   ip       当前IP
 * @param {Function} cb       回调函数
 * @error 用户已存在
 * @return user 包含 userinfo 的对象
 */
exports.userRegister = function(username, password, nickname, ip, cb) {
  async.auto({
    userExists: function userExistsFn(callback) {
      User.countByUsername(username).exec(function(err, count) {
        if (err) {
          return callback(err);
        }
        if (count > 0) {
          return callback(Utils.error(400039));
        }
        return callback(null, true);
      });
    },
    user: [
      'userExists',
      function createUserFn(callback) {
        User.create({
          username: username,
          password: password
        }).exec(callback);
      }
    ],
    userInfo: [
      'user',
      function userInfoFn(callback, result) {
        if (!result.user) {
          return callback(null, null);
        }

        UserInfo.create({
          id: result.user.id,
          nickname: nickname
        }).exec(callback);
      }
    ],
    userExtra: [
      'user',
      function userExtraFn(callback, result) {
        if (!result.user) {
          return callback(null, null);
        }

        UserExtra.create({
          id: result.user.id,
          ip: ip
        }).exec(callback);
      }
    ],
    userEasemob: [
      'user',
      function userEasemobFn(callback, result) {
        if (!result.user) {
          return callback(null, null);
        }

        UserEasemob.create({
          id: result.user.id,
          nickname: nickname,
          password: Utils.uid(10)
        }).exec(callback);
      }
    ],
    userRelation: [
      'user',
      function userRelationFn(callback, result) {
        if (!result.user) {
          return callback(null, null);
        }

        UserRelation.create({
          id: result.user.id,
          friends: [],
          fans: [],
          playmates: []
        }).exec(callback);
      }
    ],
    userFavorite: [
      'user',
      function userFavoriteFn(callback, result) {
        if (!result.user) {
          return callback(null, null);
        }

        UserFavorite.create({
          id: result.user.id
        }).exec(callback);
      }
    ],
    timeline: [
      'user',
      function timelineFn(callback, result) {
        UserTimeline.create({
          user: result.user.id,
          type: 'joined',
          content: {
            template: 'joined_the_woola',
            data: {}
          }
        }).exec(callback);
      }
    ]
  }, function(err) {
    if (err) {
      return cb(err);
    }
    return cb(null, {
      message: 'success'
    });
  });
};

/**
 * 修改用户密码
 * @param {string}   username 用户名
 * @param {string}   password 密码
 * @param {Function} callback 回调函数
 * @return boolean    是否修改成功
 */
exports.changePassword = function(username, password, callback) {
  User.update({
    username: username
  }, {
    password: password
  }).exec(function afterUpdate(err, updated) {
    if (err) {
      return callback(err);
    }

    return callback(null, (updated.length > 0));
  });
};

/**
 * 获取用户信息
 * @param {string}    id        用户id
 * @param {boolean}   self      是否当前用户请求
 * @param {string}    userId    当前用户id
 * @param {function}  callback  回调函数
 * @return  {user}    用户对象
 */
exports.userInfo = function(id, self, userId, cb) {
  if (!id) {
    return cb(Utils.error(400001));
  }
  async.auto({
    user: function userFn(callback) {
      User.withId(self, id, null, ['info', 'extra'], function(err, user) {
        if (err) {
          return callback(err);
        }
        return callback(null, user);
      });
    },
    relation: [
      'user',
      function relationFn(callback) {
        if (self) {
          return callback(null, null);
        }

        UserRelation.checkRelation(userId, id, callback);
      }
    ],
    inviter: [
      'user',
      function inviterFn(callback, result) {
        if (!self) {
          return callback(null, null);
        }
        UserInviteLog.findOne({
          invitees: id
        }).populate('inviter').exec(function(err, log) {
          if (err) {
            return callback(err);
          }
          if (!log) {
            return callback(null, '');
          }
          return callback(null, log.inviter.username);
        });
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    var returnObj = {
      info: results.user
    };
    if (results.relation) {
      returnObj.relation = results.relation;
    }
    if (self) {
      returnObj.inviter = results.inviter;
    }
    return cb(null, returnObj);
  });
};

/**
 * 更新用户信息及扩展信息
 * @param {string}   userId    用户ID
 * @param {UserInfo}   userInfo  用户信息
 * @param {UserExtra}   userExtra 用户扩展信息
 * @param {Function} cb        回调函数
 * @return {boolean} 更新成功
 */
exports.updateUserInfo = function(userId, userInfo, userExtra, inviter, cb) {
  async.auto({
    check: function checkFn(callback) {
      User.findOne(userId).exec(function(err, user) {
        if (err) {
          return callback(err);
        }
        if (!user) {
          return callback(Utils.error(400038));
        }
        return callback(null, user);
      });
    },
    info: [
      'check',
      function infoFn(callback) {
        if (!_.isEmpty(userInfo)) {
          UserInfo.update(userId, userInfo).exec(callback);
        }
        return callback(null, null);
      }
    ],
    extra: [
      'check',
      function extraFn(callback) {
        if (!_.isEmpty(userExtra)) {
          UserExtra.update(userId, userExtra).exec(callback);
        }
        return callback(null, null);
      }
    ],
    invite: [
      'check',
      function inviteFn(callback, result) {
        if (!inviter) {
          return callback(null, null);
        }
        UserInviteLog.count({
          inviter: inviter,
          invitees: result.check.username
        }).exec(function(err, count) {
          if (err) {
            return callback(err);
          }
          if (count) {
            return callback(null, null);
          }
          UserInviteLog.create({
            inviter: inviter,
            invitees: result.check.username,
            result: true
          }).exec(callback);
        });
      }
    ],
    timeline: [
      'info',
      'extra',
      function timelineFn(callback) {
        var status = {};
        if (userInfo.avatar && !_.isEmpty(userExtra.status)) {
          status = {
            user: userId,
            type: 'updateinfo',
            content: {
              template: 'update_info',
              data: {
                images: [userInfo.avatar],
                text: userExtra.status
              }
            }
          };
        } else if (userInfo.avatar) {
          status = {
            user: userId,
            type: 'updateavatar',
            content: {
              template: 'update_avatar',
              data: {
                images: [userInfo.avatar]
              }
            }
          };
        } else if (userExtra.status && !_.isEmpty(userExtra.status)) {
          status = {
            user: userId,
            type: 'updatestatus',
            content: {
              template: 'update_status',
              data: {
                text: userExtra.status
              }
            }
          };
        } else {
          return callback();
        }

        UserTimeline.create(status).exec(callback);
      }
    ]
  }, function(err) {
    if (err) {
      return cb(err);
    }
    return cb(null, {
      success: true
    });
  });
};

/**
 * 附近的人
 * @param   {User}      user      当前用户
 * @param   {float}     lat       纬度
 * @param   {float}     lng       经度
 * @param   {integer}   skip      跳过记录数
 * @param   {string}    gender    筛选性别
 * @param   {array}     sports    筛选运动
 * @param   {string}    sort      排序方式       可选
 * @param   {function}  cb        回调函数
 * @return  {total, list}   总数，列表
 */
exports.nearbyPeople = function(
  user, lat, lng, skip, gender, sports, sort, cb
) {
  var ids = [];
  var v = squel.select({
    tableAliasQuoteCharacter: '"',
    nameQuoteCharacter: '"',
    autoQuoteTableNames: true
  });
  v.from('userextra', 'ue')
    .join('user', 'u', 'u.id = ue.id')
    .join('userinfo', 'ui', 'u.id = ui.id')
    .where('u.enabled = true')
    .where('ue."atNearby" = true');

  if (gender !== 'all') {
    v.where('ui.gender = ?', gender);
  }
  if (!_.isEmpty(sports)) {
    sports = sports.split(',');
    var tmp = [];
    _.each(sports, function(value) {
      tmp.push(`'${value}'`);
    });
    sports = tmp.join(',');
    v.where(`ui."favoriteSports" ?| array[${sports}]`);
  }
  if (user && sails.config.environment !== 'development') {
    v.where('u.id != ?', user.id);
  }

  var cnts = v.clone();
  async.auto({
    total: function totalFn(callback) {
      cnts.field('count(*)', 'cnt');
      cnts.field('string_agg(u."id", \',\')', 'ids');
      cnts.where(
        'earth_box(ll_to_earth(?,?),?) @> ll_to_earth(ue.latitude,ue.longitude)',
        lat,
        lng,
        Constant.maxDistance
      );
      UserExtra.query(cnts.toString(), function(err, result) {
        if (err) {
          return callback(err);
        }
        result = result.rows.pop();
        if (+(result.cnt) > 0) {
          ids = result.ids.split(',');
          v.where('u."id" in ?', ids);
        }
        return callback(null, +(result.cnt));
      });
    },
    list: [
      'total',
      function listFn(callback, result) {
        if (!result.total) {
          return callback(null, []);
        }
        v.field('u.id')
          .field(
            `round((point(${lat}, ${lng}) <@>
              point(latitude, longitude))::numeric * 1600, 0)`,
            'distance'
          )
          .order(sort)
          .limit(Constant.listLimit)
          .offset(skip);
        User.query(v.toString(), function(err, users) {
          if (err) {
            return callback(err);
          }
          return callback(null, users.rows);
        });
      }
    ],
    process: [
      'list',
      function processFn(callback, result) {
        if (!result.total) {
          return callback(null, []);
        }
        User.withIds(ids, null, ['info', 'extra'], function(err, users) {
          if (err) {
            return callback(err);
          }
          async.map(result.list, function(obj, innercb) {
            var nobj = {};
            _.assign(nobj, users[obj.id]);
            nobj.distance = +(obj.distance);
            return innercb(null, nobj);
          }, callback);
        });
      }
    ]
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

/**
 * 关注用户
 * @param {string}   userId   当前用户ID
 * @param {string}   followId 被关注用户ID
 * @param {string}   source   来源
 * @param {Function} cb       [description]
 */
exports.followUser = function(userId, followId, source, cb) {
  function becomefriendsTimeline(_userId, _followId, fncb) {
    UserTimeline.becomeFriendsCheck(_userId, _followId, function(err, result) {
      if (err) {
        return fncb(err);
      }
      if (!result.hasHistory) {
        if (_.isEmpty(result.last)) {
          UserTimeline.create({
            user: _userId,
            type: 'becomefriends',
            isTemplate: true,
            content: {
              template: 'become_friends_with_{{user}}',
              data: {
                user: [_followId]
              }
            }
          }).exec(fncb);
        } else {
          result.last.content.data.user.push(followId);
          result.last.save(fncb);
        }
      } else {
        return fncb();
      }
    });
  }

  async.auto({
    check: function checkFn(callback) {
      User.count(followId).exec(callback);
    },
    process: [
      'check',
      function processFn(callback, result) {
        if (!result.check) {
          return callback(Utils.error(400038));
        }
        UserRelation.findOne(userId).exec(function(err, obj) {
          if (err) {
            return callback(err);
          }
          var friend = _.find(obj.friends, {
            id: followId
          });
          if (friend) {
            return callback(null, {
              message: 'user_have_been_follow'
            });
          } else {
            obj.friends.push({
              id: followId,
              source: source,
              date: moment().toData()
            });
            obj.save(function() {
              return callback(null, {
                message: 'follow_success'
              });
            });
          }
        });
      }
    ],
    updateFollow: [
      'process',
      function updateFollowFn(callback) {
        UserRelation.findOne(followId).exec(function(err, obj) {
          if (err) {
            return callback(err);
          }
          var fans = _.find(obj.fans, {
            id: userId
          });
          if (!fans) {
            obj.fans.push({
              id: userId,
              source: source,
              date: moment().toData()
            });
            obj.save(callback);
          } else {
            return callback(null, null);
          }
        });
      }
    ],
    timeline: [
      'updateFollow',
      function timelineFn(callback) {
        UserRelation.checkRelation(userId, followId, function(err, obj) {
          if (err) {
            return callback(err);
          }
          if (obj.isFriend && obj.isFan) {
            async.auto({
              friend: function friendFn(icb) {
                becomefriendsTimeline(userId, followId, icb);
              },
              fans: function fansFn(icb) {
                becomefriendsTimeline(followId, userId, icb);
              }
            }, callback);
          } else {
            return callback(null, null);
          }
        });
        return callback();
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
 * 取消关注用户
 * @param {string}   userId     当前用户ID
 * @param {string}   unfollowId 被取消关注用户ID
 * @param {Function} cb         回调函数
 */
exports.unfollowUser = function(userId, unfollowId, cb) {
  async.auto({
    check: function checkFn(callback) {
      User.count(unfollowId).exec(callback);
    },
    process: [
      'check',
      function processFn(callback, result) {
        if (!result.check) {
          return callback(Utils.error(400038));
        }
        UserRelation.findOne(userId).exec(function(err, obj) {
          if (err) {
            return callback(err);
          }
          var friend = _.find(obj.friends, {
            id: unfollowId
          });
          if (!friend) {
            return callback(null, {
              message: 'dose_not_follow_user'
            });
          } else {
            _.remove(obj.friends, function(_obj) {
              return _obj.id === unfollowId;
            });
            obj.save(function() {
              return callback(null, {
                message: 'unfollow_success'
              });
            });
          }
        });
      }
    ],
    updateFollow: [
      'process',
      function updateFollowFn(callback) {
        UserRelation.findOne(unfollowId).exec(function(err, obj) {
          if (err) {
            return callback(err);
          }
          var fans = _.find(obj.fans, {
            id: userId
          });
          if (fans) {
            _.remove(obj.fans, function(_obj) {
              return _obj.id === userId;
            });
            obj.save(callback);
          } else {
            return callback(null, null);
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
 * 把用户拉黑
 * @param  {string}   userId  当前用户ID
 * @param  {string}   blockId 被拉黑用户ID
 * @param  {Function} cb      回调函数
 * @return {[type]}           处理结果
 */
exports.blockUser = function(userId, blockId, cb) {
  async.auto({
    check: function checkFn(callback) {
      User.count(blockId).exec(callback);
    },
    process: [
      'check',
      function processFn(callback, result) {
        if (!result.check) {
          return callback(Utils.error(400038));
        }
        UserRelation.findOne(userId).exec(function(err, obj) {
          if (err) {
            return callback(err);
          }
          var block = _.indexOf(obj.blocks, blockId);
          if (block >= 0) {
            return callback(null, {
              message: 'user_have_been_blocked'
            });
          } else {
            _.remove(obj.friends, function(_obj) {
              return _obj.id === blockId;
            });
            _.remove(obj.fans, function(_obj) {
              return _obj.id === blockId;
            });
            obj.blocks.push(blockId);
            obj.save(function() {
              return callback(null, {
                message: 'block_success'
              });
            });
          }
        });
      }
    ],
    updateBlock: [
      'process',
      function updateBlockFn(callback) {
        UserRelation.findOne(blockId).exec(function(err, obj) {
          if (err) {
            return callback(err);
          }
          _.remove(obj.friends, function(_obj) {
            return _obj.id === userId;
          });
          _.remove(obj.fans, function(_obj) {
            return _obj.id === userId;
          });
          obj.save(callback);
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
 * 把用户取消拉黑
 * @param  {string}   userId  当前用户ID
 * @param  {string}   blockId 已拉黑用户ID
 * @param  {Function} cb      回调函数
 * @return {[type]}           处理结果
 */
exports.unblockUser = function(userId, blockId, cb) {
  async.auto({
    check: function checkFn(callback) {
      User.count(blockId).exec(callback);
    },
    process: [
      'check',
      function processFn(callback, result) {
        if (!result.check) {
          return callback(Utils.error(400038));
        }
        UserRelation.findOne(userId).exec(function(err, obj) {
          if (err) {
            return callback(err);
          }
          var block = _.indexOf(obj.blocks, blockId);
          if (block >= 0) {
            _.remove(obj.blocks, function(id) {
              return id === blockId;
            });
            obj.save(function() {
              return callback(null, {
                message: 'unblock_success'
              });
            });
          } else {
            return callback(null, {
              message: 'user_does_not_blocked'
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
 * 获取好友关系
 * @param  {string}     userId    用户ID
 * @param  {string}     type      关系类别
 * @param  {boolean}    detail    是否获取详情
 * @param  {boolean}    simple    简单模式
 * @param  {integer}    skip      跳过记录数
 * @param  {Function}   cb        回调函数
 * @return {object}          total, list
 */
exports.relation = function(userId, type, detail, simple, skip, cb) {
  if (type === 'blocks') {
    return UserV1.blockList(userId, skip, cb);
  }
  async.auto({
    total: function totalFn(callback) {
      UserExtra.findOne(userId).exec(function(err, extra) {
        if (err) {
          return callback(err);
        }
        return callback(null, extra[type]);
      });
    },
    list: [
      'total',
      function listFn(callback, result) {
        if (!result.total) {
          return callback(null, []);
        }

        var needMore = detail || simple;
        var limit = needMore ? Constant.listLimit : Constant.listLimit * 20;
        var q = squel.select({
          tableAliasQuoteCharacter: ''
        }).from('"userrelation"', '"ur"');
        q.from(
          `jsonb_populate_recordset(null::friend_type,"ur".${type})`,
          '"f"'
        );
        q.field('f.*').where('ur.id = ?', userId);
        q.limit(limit).offset(skip);

        User.query(q.toString(), function(err, results) {
          if (err) {
            return callback(err);
          }
          return callback(null, results.rows);
        });
      }
    ],
    process: [
      'list',
      function processFn(callback, result) {
        if (_.isEmpty(result.list)) {
          return callback(null, []);
        }
        var ids = _.pluck(result.list, 'id');
        if (!detail && !simple) {
          return callback(null, ids);
        }

        if (detail) {
          User.withIds(ids, null, ['info', 'extra'], function(err, users) {
            if (err) {
              return callback(err);
            }
            async.map(result.list, function(obj, innercb) {
              obj.user = users[obj.id];
              delete obj.id;
              return innercb(null, obj);
            }, callback);
          });
        } else if (simple) {
          var q = squel.select({
            tableAliasQuoteCharacter: ''
          }).from('"userinfo"', '"ui"');
          q.field('id').field('nickname').field('avatar')
            .where('id in ?', ids);
          UserInfo.query(q.toString(), function(err, infos) {
            if (err) {
              return callback(err);
            }
            var temp = _.indexBy(infos.rows, 'id');
            async.map(result.list, function(obj, innercb) {
              obj.user = temp[obj.id];
              delete obj.id;
              return innercb(null, obj);
            }, function(error, results) {
              return callback(error, results);
            });
          });
        }
      }
    ]
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

/**
 * 用户拉黑列表
 * @param  {string}     userId  当前用户ID
 * @param  {integer}    skip    跳过记录数字
 * @param  {Function}   cb      回调函数
 * @return {Object}             total,list
 */
exports.blockList = function(userId, skip, cb) {
  async.auto({
    total: function totalFn(callback) {
      var cnt = squel.select({
        tableAliasQuoteCharacter: ''
      }).from('"userrelation"', '"ur"');
      cnt.field('jsonb_array_length("ur"."blocks")', 'total')
        .where('"ur"."id" = ?', userId);

      User.query(cnt.toString(), function(err, results) {
        if (err) {
          return callback(err);
        }
        results = results.rows;
        return callback(null, results[0].total);
      });
    },
    list: [
      'total',
      function listFn(callback, result) {
        if (!result.total) {
          return callback(null, []);
        }
        var limit = Constant.listLimit * 20;
        var q = squel.select({
          tableAliasQuoteCharacter: ''
        }).from('"userrelation"', '"ur"');
        q.field('jsonb_array_elements("ur"."blocks")', 'id')
          .where('"ur"."id" = ?', userId)
          .limit(limit).offset(skip);

        User.query(q.toString(), function(err, results) {
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
};

/**
 * 获取用户时间线
 * @param  {string}     id       用户ID
 * @param  {string}     userId   当前用户ID
 * @param  {date}       lastdate 最后更新时间
 * @param  {integer}    skip     跳过记录数
 * @param  {Function}   cb       回调函数
 * @return {Object}              {total,list}
 */
exports.timeline = function(id, userId, lastdate, skip, cb) {
  if (!id) {
    id = userId;
  }
  var self = id === userId;
  var filterObj = {
    where: {
      enabled: true,
      user: id
    },
    limit: Constant.listLimit,
    skip: skip,
    sort: 'createdAt desc'
  };
  if (lastdate) {
    filterObj.where.updatedAt = {
      '>': lastdate
    };
  }

  async.auto({
    check: function checkFn(callback) {
      if (self) {
        return callback(null, null);
      }
      UserRelation.checkRelation(userId, id, function(err, obj) {
        if (err) {
          return callback(err);
        }
        // TODO: 确认是否只有好友成立才能看到好友可见的内容
        if (obj.isFriend && obj.isFan) {
          filterObj.where.visible = ['public', 'friend'];
        } else {
          filterObj.where.visible = 'public';
        }
        return callback(null, null);
      });
    },
    total: [
      'check',
      function totalFn(callback) {
        UserTimeline.count(filterObj.where).exec(callback);
      }
    ],
    list: [
      'total',
      function listFn(callback, result) {
        if (!result.total) {
          return callback(null, []);
        }
        UserTimeline.find(filterObj).exec(callback);
      }
    ],
    process: [
      'list',
      function processFn(callback, result) {
        if (!result.total) {
          return callback(null, []);
        }
        async.map(result.list, function(obj, objcb) {
          if (_.isEmpty(obj.content.data)) {
            return objcb(null, obj);
          }
          async.each(_.keys(obj.content.data), function(key, datacb) {
            switch (key) {
              case 'user':
                UserInfo.find(obj.content.data[key]).exec(function(err, infos) {
                  if (err) {
                    return datacb(err);
                  }
                  var users = [];
                  _.each(infos, function(info) {
                    users.push(_.pick(info, ['id', 'nickname', 'avatar']));
                  });
                  obj.content.data[key] = users;
                  return datacb();
                });
                break;
              case 'post':
                Post.findOne(obj.content.data[key]).exec(function(err, post) {
                  if (err) {
                    return datacb(err);
                  }
                  obj.content.data[key] = post;
                  return datacb();
                });
                break;
              default:
                return datacb();
            }
          }, function(err) {
            if (err) {
              return objcb(err);
            }
            return objcb(null, obj);
          });
        }, function(err, results) {
          if (err) {
            return callback(err);
          }
          return callback(null, results);
        });
      }
    ]
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

/**
 * 获取用户的点赞ID列表
 * @param  {string}   userId 当前用户ID
 * @param  {string}   type   点赞类型
 * @param  {integer}   skip   跳过记录数
 * @param  {Function} cb     回调函数
 * @return {[type]}          [description]
 */
exports.likes = function(userId, type, skip, cb) {
  async.auto({
    posts: function postsFn(callback) {
      if (type !== 'posts') {
        return callback(null, {});
      }
      async.auto({
        total: function totalFn(innercb) {
          PostLike.count({
            user: userId
          }).exec(innercb);
        },
        list: [
          'total',
          function listFn(innercb, result) {
            if (!result.total) {
              return innercb(null, []);
            }
            PostLike.find({
              where: {
                user: userId
              },
              sort: 'createdAt desc',
              limit: Constant.listLimit * 20
            }).exec(function(err, obj) {
              if (err) {
                return innercb(err);
              }
              var ids = _.pluck(obj, 'post');
              return innercb(null, ids);
            });
          }
        ]
      }, function(err, results) {
        if (err) {
          return callback(err);
        }
        return callback(null, results);
      });
    }
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results[type]);
  });
};

/**
 * 注册用户设备
 * @param  {string}   clientType 当前设备类型
 * @param  {User}     user       当前用户
 * @param  {string}   app        注册给哪个应用
 * @param  {string}   token      设备Token
 * @param  {Function} cb         回调函数
 * @return {Object}              返回注册状态
 */
exports.registerDevice = function(clientType, user, app, token, cb) {
  var userId = '';
  if (!_.isEmpty(user)) {
    user = user.id;
  }
  async.auto({
    device: function deviceFn(callback) {
      UserDevice.findOne({
        type: clientType,
        app: app,
        user: userId,
        enabled: true
      }).exec(callback);
    },
    result: [
      'device',
      function resultFn(callback, result) {
        if (result.device) {
          result.device.token = token;
          result.device.save(function(err) {
            if (err) {
              return callback(err);
            }
            return callback(null, {
              status: true
            });
          });
        } else {
          UserDevice.create({
            type: clientType,
            app: app,
            user: userId,
            token: token
          }).exec(function(err) {
            if (err) {
              return callback(err);
            }
            return callback(null, {
              status: true
            });
          });
        }
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.result);
  });
};

/**
 * 移除用户设备
 * @param  {string}   clientType 当前设备类型
 * @param  {User}     user       当前用户
 * @param  {string}   app        注册给哪个应用
 * @param  {string}   token      设备Token
 * @param  {Function} cb         回调函数
 * @return {Object}              返回注册状态
 */
exports.removeDevice = function(clientType, user, app, token, cb) {
  var userId = '';
  if (!_.isEmpty(user)) {
    user = user.id;
  }

  UserDevice.update({
    type: clientType,
    app: app,
    user: userId,
    token: token
  }, {
    enabled: false
  }).exec(function(err) {
    if (err) {
      return cb(err);
    }
    return cb(null, {
      status: true
    });
  });
};

function saveThirdParty(isCreate, type, userId, info, cb) {
  async.auto({
    check: function checkFn(callback) {
      var id = info.unionId || info.openId || info.uid;
      UserExtra.checkThirdPartyLinked(type, id, isCreate, userId, callback);
    },
    process: [
      'check',
      function processFn(callback) {
        UserExtra.findOne(userId).exec(function(err, extra) {
          if (err) {
            return callback(err);
          }
          extra.thirdParty[type] = info;
          extra.save(function(error) {
            if (error) {
              return callback(error);
            }
            return callback(null, {
              status: true
            });
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
}

/**
 * 关联第三方账号
 * @param  {string}   type 账号类型
 * @param  {string}   userId 当前用户ID
 * @param  {Object}   info 账号信息
 * @param  {Function} cb   回调函数
 */
exports.linkThirdParty = function(type, userId, info, cb) {
  return saveThirdParty(true, type, userId, info, cb);
};

/**
 * 更新第三方账号信息
 * @param  {string}   type   账号类型
 * @param  {string}   userId 当前用户ID
 * @param  {Object}   info   要更新的信息
 * @param  {Function} cb     回调函数
 */
exports.updateThirdParty = function(type, userId, info, cb) {
  return saveThirdParty(false, type, userId, info, cb);
};

/**
 * 解除第三方账号关联
 * @param  {string}   type   账号类型
 * @param  {string}   userId 当前用户ID
 * @param  {Function} cb     回调函数
 */
exports.removeThirdParty = function(type, userId, cb) {
  UserExtra.findOne(userId).exec(function(err, extra) {
    if (err) {
      return cb(err);
    }
    extra.thirdParty = _.omit(extra.thirdParty, type);
    extra.save(function(error) {
      if (error) {
        return cb(error);
      }
      return cb(null, {
        status: true
      });
    });
  });
};

/**
 * 添加收藏
 * @param  {string}   userId   当前用户ID
 * @param  {string}   type     收藏类型
 * @param  {string}   objectId 收藏对象ID
 * @param  {Function} cb       回调函数
 */
exports.favorite = function(userId, type, objectId, cb) {
  var pluralize = require('pluralize'),
    pkey = pluralize(type),
    favObj = {
      id: objectId,
      date: moment().unix()
    };

  async.auto({
    userFav: function userFavFn(callback) {
      UserFavorite.findOne(userId).exec(callback);
    },
    exists: [
      'userFav',
      function existsFn(callback, result) {
        if (!result.userFav) {
          return callback(null, null);
        }
        var arr = result.userFav[pkey];
        var existObj = _.find(arr, function(fobj) {
          return fobj.id === objectId;
        });
        if (_.isUndefined(existObj)) {
          result.userFav[pkey].push(favObj);
          result.userFav.save(function(err) {
            if (err) {
              return callback(err);
            }
            return callback(null, {
              message: 'favorite_success'
            });
          });
        } else {
          return callback(null, `${type}_is_favorited`);
        }
      }
    ],
    noExists: [
      'userFav',
      function noExistsFn(callback, result) {
        if (result.userFav) {
          return callback(null, null);
        }

        var newObj = {
          id: userId
        };
        newObj[pkey] = [favObj];
        UserFavorite.create(newObj).exec(function(err) {
          if (err) {
            return callback(err);
          }
          return callback(null, {
            message: 'favorite_success'
          });
        });
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.exists || results.noExists);
  });
};

/**
 * 取消收藏
 * @param  {string}   userId   当前用户ID
 * @param  {string}   type     收藏类型
 * @param  {string}   objectId 收藏对象ID
 * @param  {Function} cb       回调函数
 */
exports.unFavorite = function(userId, type, objectId, cb) {
  var pluralize = require('pluralize'),
    pkey = pluralize(type);

  async.auto({
    userFav: function userFavFn(callback) {
      UserFavorite.findOne(userId).exec(callback);
    },
    process: [
      'userFav',
      function processFn(callback, result) {
        if (result.userFav) {
          _.remove(result.userFav[pkey], function(fobj) {
            return fobj.id === objectId;
          });
          result.userFav.save(function(err) {
            if (err) {
              return callback(err);
            }
            return callback(null, {
              message: 'unfavorite_success'
            });
          });
        } else {
          return callback(null, {
            message: 'no_favorite_record'
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
 * 附近的教练接口
 * @param  {string }    userId   当前用地
 * @param  {float}      lat      纬度
 * @param  {float}      lng      经度
 * @param  {string}     gender   性别
 * @param  {string}     category 运动项目
 * @param  {integer}    city     城市
 * @param  {integer}    district 行政区
 * @param  {string}     sort     排序
 *            distance|hot(订单数)|recommend(&displayOrder)|price-asc|price-desc
 * @param  {integer}    skip     跳过记录数
 */
exports.nearByCoach = function(userId, lat, lng, gender, category, city, district, sort, skip, cb) {
  var ids = [];
  var v = squel.select({
    tableAliasQuoteCharacter: '"',
    nameQuoteCharacter: '"',
    autoQuoteTableNames: true
  });
  // TODO: 加入订单数排序
  v.from('userextra', 'ue')
    .join('user', 'u', 'u.id = ue.id')
    .join('userinfo', 'ui', 'u.id = ui.id')
    .join('coachinfo', 'ci', 'u.id = ci.id')
    .join('coachprice', 'cp', 'u.id = cp.id')
    .where('u.enabled = true')
    .where('u."verifyCoach" = true');

  if (gender !== 'all') {
    v.where('ui.gender = ?', gender);
  }
  if (category && category !== 'all') {
    v.where(`ci.category ?| array['${category}']`);
  }
  if (userId && sails.config.environment !== 'development') {
    v.where('u.id != ?', userId);
  }

  async.auto({
    district: function districtFn(callback) {
      if (!district) {
        ObjectCache.findOneByType('districts').exec(function(err, cacheobj) {
          if (err) {
            return callback(err);
          }
          var districts = cacheobj.data;
          var tmp = [];
          _.forIn(districts, function(obj, key) {
            if (obj.city === +city) {
              tmp.push(`'${key}'`);
            }
          });
          district = tmp.join(',');
          v.where(`ci.regions ?| array[${district}]`);
          return callback(null, null);
        });
      } else {
        v.where(`ci.regions ?| array['${district}']`);
        return callback(null, null);
      }
    },
    total: [
      'district',
      function totalFn(callback) {
        var cnts = v.clone();
        cnts.field('count(*)', 'cnt');
        cnts.field('string_agg(u."id", \',\')', 'ids');
        cnts.where(
          'earth_box(ll_to_earth(?,?),?) @> ll_to_earth(ue.latitude,ue.longitude)',
          lat,
          lng,
          Constant.maxDistance
        );
        UserExtra.query(cnts.toString(), function(err, result) {
          if (err) {
            return callback(err);
          }
          result = result.rows.pop();
          if (+(result.cnt) > 0) {
            ids = result.ids.split(',');
            v.where('u."id" in ?', ids);
          }
          return callback(null, +(result.cnt));
        });
      }
    ],
    list: [
      'total',
      function listFn(callback, result) {
        if (!result.total) {
          return callback(null, []);
        }
        v.field('u.id')
          .field(
            `round((point(${lat}, ${lng}) <@>
              point(latitude, longitude))::numeric * 1600, 0)`,
            'distance'
          )
          .field('cp.price')
          .limit(Constant.listLimit)
          .offset(skip);

        switch (sort) {
          case 'price-asc':
          case 'price-desc':
            sort = sort.split('-');
            v.order(sort[0], sort[1] !== 'desc');
            break;
          case 'recommend':
            v.order('ci.recommend', false);
            v.order('ci."displayOrder"');
            break;
          default:
            v.order('distance');
            break;
        }

        User.query(v.toString(), function(err, coachs) {
          if (err) {
            return callback(err);
          }
          return callback(null, coachs.rows);
        });
      }
    ],
    process: [
      'list',
      function processFn(callback, result) {
        if (!result.total) {
          return callback(null, []);
        }
        ids = _.pluck(result.list, 'id');

        User.withIds(ids, null, ['info', 'extra', 'coachInfo'], function(err, users) {
          if (err) {
            return callback(err);
          }
          async.map(result.list, function(obj, innercb) {
            var nobj = {};
            _.assign(nobj, users[obj.id]);
            nobj.distance = +(obj.distance);
            nobj.price = {
              price: +(obj.price)
            };
            if (_.has(nobj, 'coachInfo')) {
              delete nobj.coachInfo.idCardType;
              delete nobj.coachInfo.idNumber;
            }
            return innercb(null, nobj);
          }, callback);
        });
      }
    ]
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

exports.searchUserByUsername = function(userId, username, cb) {
  async.auto({
    user: function userFn(callback) {
      User.withId(false, null, {
        username: username
      }, ['info', 'extra'], callback);
    },
    relation: [
      'user',
      function relationFn(callback, result) {
        UserRelation.checkRelation(userId, result.user.id, callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    var returnObj = {
      info: results.user
    };
    if (!_.isEmpty(results.relation)) {
      returnObj.relation = results.relation;
    }
    return cb(null, returnObj);
  });
};
