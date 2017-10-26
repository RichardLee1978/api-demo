'use strict';

function checkActivity(activityNo, callback) {
  Activity.findOneBySerialNumber(activityNo)
    .populate('contest', {
      sort: 'index ASC'
    }).exec(function(err, activity) {
      if (err) {
        return callback(err);
      }
      if (!activity) {
        return callback('活动不存在');
      }
      return callback(null, activity);
    }
  );
}

exports.userInfo = function(unionId, phone, activityNo, cb) {
  async.auto({
    getUserByPhone: function getUserByPhoneFn(callback) {
      if (!phone) {
        return callback(null, null);
      }
      User.withId(false, null, {
        username: phone
      }, ['info'], true, callback);
    },
    getUserByUnionId: function getUserByUnionIdFn(callback) {
      if (!unionId) {
        return callback(null, null);
      }
      UserExtra.getUserIdWithThirdParty('wechat', unionId, function(err, userId) {
        if (!userId) {
          return callback(null, null);
        }
        User.withId(false, userId, null, ['info'], true, callback);
      });
    },
    user: [
      'getUserByPhone',
      'getUserByUnionId',
      function userFn(callback, result) {
        var user = result.getUserByPhone || result.getUserByUnionId;
        if (!user) {
          return callback(null, {});
        }
        var newInfo = {
          id: user.id,
          phone: user.username,
          name: user.info.realname,
          birthday: user.info.birthday,
          gender: user.info.gender
        };
        return callback(null, newInfo);
      }
    ],
    activity: [
      'user',
      function activityFn(callback, result) {
        if (!result.user || !activityNo) {
          return callback(null, {});
        }
        return checkActivity(activityNo, callback);
      }
    ],
    orders: [
      'activity',
      function ordersFn(callback, result) {
        if (!result.user || !activityNo) {
          return callback(null, {});
        }
        ActivityParticipant.find({
          or: [{
            user: result.user.id
          }, {
            phone: result.user.phone
          }],
          enabled: true
        }).exec(function(err, results) {
          if (err) {
            return callback(err);
          }
          var orderIds = _.uniq(_.pluck(results, 'order'));;

          ActivityOrder.find({
            id: orderIds,
            activity: result.activity.id
          }).populateAll().exec(function(_err, orders) {
            if (_err) {
              return callback(_err);
            }
            if (!orders) {
              return callback(null, {});
            }
            return callback(null, orders);
          });
        });
      }
    ],
    process: [
      'activity',
      'orders',
      'user',
      function processFn(callback, result) {
        if (!result.user || !activityNo) {
          return callback(null, []);
        }
        var details =  [],
          participants = [];

        _.each(result.orders, function(order) {
          details = _.union(details, order.detail);
          participants = _.union(participants, order.participants);
        });
        var obj = [];

        _.each(participants, function(pObj) {
          var detail = _.find(details, {
            id: pObj.orderdetail,
            enabled: true
          });
          var fObj = {
            event: detail.event
          };
          var iObj = _.find(obj, fObj);
          if (!iObj) {
            iObj = _.clone(fObj);
            if (!phone) {
              iObj.teammate = [];
            }
            obj.push(iObj);
          }

          if (pObj.user !== result.user.id && !phone) {
            iObj.teammate.push({
              id: pObj.user,
              name: pObj.name,
              phone: pObj.phone,
              birthday: pObj.birthday,
              gender: pObj.gender
            });
          }
        });
        return callback(null, obj);
      }
    ]
  }, function(err, results) {
    if (err) {
      if (err.message && +(err.message) === 400038) {
        return cb(null, {
          user: {},
          activitys: []
        });
      } else {
        return cb(err);
      }
    }
    return cb(null, {
      user: results.user,
      activitys: results.process
    });
  });
};
exports.registerUser = function(phone, nickname, ip, realname, birthday, gender, info, cb) {
  var password = Utils.randomCode(6);
  async.auto({
    user: function userFn(callback) {
      UserV1.userRegister(phone, password, nickname, ip, function(err) {
        if (err) {
          return callback(err);
        }
        User.withId(false, null, {
          username: phone
        }, ['info'], true, callback);
      });
    },
    info: [
      'user',
      function infoFn(callback, result) {
        UserV1.updateUserInfo(result.user.id, {
          realname: realname,
          birthday: birthday,
          gender: gender,
          city: 1,
          district: 1
        }, {}, null, callback);
      }
    ],
    linkWeChat: [
      'user',
      function linkWeChatFn(callback, result) {
        return UserV1.linkThirdParty('wechat', result.user.id, info, callback);
      }
    ],
    returnObj: [
      'info',
      function returnObjFn(callback, result) {
        var returnInfo = {
          id: result.user.id,
          phone: phone,
          name: realname,
          birthday: birthday,
          gender: gender
        };
        return callback(null, returnInfo);
      }
    ],
    sms: [
      'linkWeChat',
      function smsFn(callback, result) {
        SMS.sendBusinessSms(
          'activity-register',
          phone,
          `您已成为吾拉体育用户，账号: ${phone}，密码: ${password}，可凭以上信息登录吾拉相关产品。`,
          callback
        );
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, {
      user: results.returnObj,
      activitys: []
    });
  });
};
exports.userLogin = function(phone, password, info, activityNo, cb) {
  async.auto({
    user: function userFn(callback) {
      User.findOneByUsername(phone).exec(function(err, user) {
        if (err) {
          return callback(err);
        }
        if (!user) {
          return callback('用户不存在');
        }
        var bcrypt = require('bcrypt');
        bcrypt.compare(password, user.password, function(_err, valid) {
          if (_err) {
            return callback(_err);
          }
          if (!valid) {
            return callback('密码不正确');
          }

          User.withId(true, user.id, null, ['info', 'extra'], true, callback);
        });
      });
    },
    checkUserWeChat: [
      'user',
      function checkUserWeChatFn(callback, result) {
        var weObj = result.user.extra.thirdParty.wechat;
        if (weObj && weObj.unionId !== info.unionId) {
          return callback('该帐号已经绑定其他微信帐号，请使用绑定的微信帐号操作，如需解绑请在应用内操作或联系客服。');
        }
        return callback(null, null);
      }
    ],
    linkWeChat: [
      'checkUserWeChat',
      function linkWeChatFn(callback, result) {
        return UserV1.linkThirdParty('wechat', result.user.id, info, callback);
      }
    ],
    returnObj: [
      'linkWeChat',
      function returnObjFn(callback, result) {
        WeChatService.userInfo(info.unionId, null, activityNo, callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.returnObj);
  });
};
exports.linkUser = function(phone, info, activityNo, cb) {
  async.auto({
    user: function userFn(callback) {
      User.withId(false, null, {
        username: phone
      }, ['info'], true, callback);
    },
    linkWeChat: [
      'user',
      function linkWeChatFn(callback, result) {
        return UserV1.linkThirdParty('wechat', result.user.id, info, callback);
      }
    ],
    returnObj: [
      'user',
      function returnObjFn(callback, result) {
        UserExtra.findOne(result.user.id).exec(function(err, ueObj) {
          if (err) {
            return callback(err);
          }

          WeChatService.userInfo(ueObj.thirdParty.wechat.unionId, null, activityNo, callback);
        });
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.returnObj);
  });
};
exports.activityInfo = function(activityNo, cb) {
  async.auto({
    activity: function activityFn(callback) {
      return checkActivity(activityNo, callback);
    }
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results);
  });
};
exports.activityParticipants = function(activityNo, cb) {
  async.auto({
    activity: function activityFn(callback) {
      return checkActivity(activityNo, callback);
    },
    participants: [
      'activity',
      function participantsFn(callback, result) {
        ActivityOrder.find({
          activity: result.activity.id,
          enabled: true
        }).populateAll().exec(function(err, orders) {
          if (err) {
            return callback(err);
          }

          var obj = {};
          if (!orders) {
            return callback(null, obj);
          }

          _.each(result.activity[result.activity.type], function(detail) {
            obj[detail.id] = [];
          });

          async.each(orders, function(order, innercb) {
            _.each(order.detail, function(orderdetail) {
              var participants = _.filter(order.participants, {
                orderdetail: orderdetail.id
              });
              participants.forEach(function(pobj) {
                if (!_.isObject(pobj)) {
                  return;
                }
                obj[orderdetail.event].push({
                  team: pobj.team,
                  name: pobj.name,
                  phone: pobj.phone,
                  gender: pobj.gender
                });
              });
            });
            return innercb(null, null);
          }, function() {
            return callback(null, obj);
          });
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
exports.createActivityOrder = function(activityNo, order, peoples, cb) {
  var users = [],
    oldusers = [];
  async.auto({
    activity: function activityFn(callback) {
      return checkActivity(activityNo, callback);
    },
    order: [
      'activity',
      function orderFn(callback, result) {
        order.activity = result.activity.id;
        ActivityOrder.create(order).exec(callback);
      }
    ],
    detail: [
      'order',
      function detailFn(callback, result) {
        var events = result.activity[result.activity.type];
        var content = `您已成功报名${result.activity.activityName()} `;
        var unionStrArr = [];
        if ((peoples.length - 1) > 0) {
          unionStrArr = Array(peoples.length - 1).fill('与');
        }

        async.each(peoples, function(detail, innercb) {
          try {
            var eObj = _.find(events, {id: detail.event});
            var teamIndex = eObj.signed;
            teamIndex++;

            content += eObj.title;

            ActivityOrderDetail.create({
              order: result.order.id,
              amount: detail.amount,
              event: detail.event
            }).exec(function(err, record) {
              if (err) {
                return innercb(err);
              }
              var participants = detail.participants;
              var teammateNameArr = [];
              _.each(participants, function(participant) {
                if (!participant.user) {
                  users.push({
                    username: participant.phone,
                    realname: participant.name,
                    birthday: participant.birthday,
                    gender: participant.gender,
                    event: `${result.activity.activityName()} ${eObj.title}`
                  });
                } else if (participant.user !== order.user) {
                  oldusers.push({
                    phone: participant.phone,
                    event: `${result.activity.activityName()} ${eObj.title}`
                  });
                }
                participant.order = result.order.id;
                participant.orderdetail = record.id;
                participant.team = teamIndex;

                if (participant.user !== order.user) {
                  teammateNameArr.push(participant.name);
                }
              });

              if (teammateNameArr.length > 0) {
                content += `(队友：${teammateNameArr.join('、')})`;
              }
              var unionStr = unionStrArr.pop();
              if (unionStr) {
                content += unionStr;
              }

              ActivityParticipant.create(participants).exec(innercb);
            });
          } catch (e) {
            content = '';
            return innercb(e);
          }
        }, function(err) {
          if (err) {
            return callback(err);
          }
          content += '，查询更多比赛讯息请关注吾拉微信公众号。';
          SMS.sendBusinessSms(
            'activity-signup',
            order.phone,
            content,
            callback
          );
        });
      }
    ],
    processUser: [
      'detail',
      function processUserFn(callback) {
        if (_.isEmpty(users)) {
          return callback(null, null);
        }
        async.each(users, function(newUser, eachcb) {
          var newUserPassword = Utils.randomCode(6);

          async.auto({
            user: function userFn(innercb) {
              UserV1.userRegister(
                newUser.username,
                newUserPassword,
                '参赛选手', '127.0.0.1',
                function(err) {
                  if (err) {
                    return innercb(err);
                  }
                  User.withId(false, null, {
                    username: newUser.username
                  }, null, true, innercb);
                }
              );
            },
            info: [
              'user',
              function infoFn(innercb, result) {
                UserV1.updateUserInfo(result.user.id, {
                  realname: newUser.realname,
                  birthday: newUser.birthday,
                  gender: newUser.gender,
                  city: 1,
                  district: 1
                }, {}, null, innercb);
              }
            ],
            updateParticipants: [
              'user',
              function updateParticipantsFn(innercb, result) {
                ActivityParticipant.update({
                  phone: newUser.username
                }, {
                  user: result.user.id
                }).exec(innercb);
              }
            ],
            newUserSMS: [
              'user',
              function newUserSMSFn(innercb, result) {
                SMS.sendBusinessSms(
                  'activity-register',
                  newUser.username,
                  `您已成为吾拉体育用户，账号: ${newUser.username}，密码: ${newUserPassword}，可凭以上信息登录吾拉相关产品。`,
                  innercb
                );
              }
            ],
            signupSMS: [
              'user',
              function signupSMSFn(innercb, result) {
                SMS.sendBusinessSms(
                  'activity-signup',
                  newUser.username,
                  `您的好友${order.name}已成功替你报名${newUser.event}，查询更多比赛讯息请关注吾拉微信公众号。`,
                  innercb
                );
              }
            ]
          }, eachcb);
        }, callback);
      }
    ],
    oldUserSMS: [
      'detail',
      function oldUserSMSFn(callback) {
        if (_.isEmpty(oldusers)) {
          return callback(null, null);
        }
        async.each(oldusers, function(oldUser, innercb) {
          SMS.sendBusinessSms(
            'activity-signup',
            oldUser.phone,
            `您的好友${order.name}已成功替你报名${oldUser.event}，查询更多比赛讯息请关注吾拉微信公众号。`,
            innercb
          );
        }, callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, {
      status: true
    });
  });
};
