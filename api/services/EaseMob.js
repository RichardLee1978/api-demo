'use strict';
var host = 'https://a1.easemob.com/letsdosports/woola/';

/**
 * 发送环信请求
 * @param {string}   method   请求方式
 * @param {string}   uri      请求路径
 * @param {object}   data     请求数据
 * @param {Function} callback 回调函数
 */
function sendRequest(method, uri, data, cb) {
  var request = require('request');
  if (typeof data === 'function') {
    cb = data;
    data = null;
  }
  var obj = {
    baseUrl: host,
    method: method,
    uri: uri,
    json: true,
    timeout: 10000
  };

  async.auto({
    checkToken: function checkTokenFn(callback) {
      if (uri === 'token') {
        return callback(null, true);
      } else {
        Cache.exists(Constant.IMToken, function(err, exists) {
          if (err) {
            return callback(err);
          }
          if (!exists) {
            return callback(Utils.error('easemob_token_dose_not_exists'));
          } else {
            Cache.get(Constant.IMToken, function(error, token) {
              if (error) {
                return callback(error);
              }
              obj.auth = {
                'bearer': token
              };
              return callback(null, true);
            });
          }
        });
      }
    },
    result: ['checkToken',
      function resultFn(callback) {
        if (_.contains(['post', 'put', 'patch'], method.toLowerCase()) && data) {
          obj.body = data;
        }

        request(obj, function(err, response, body) {
          if (err) {
            return callback(err);
          }
          if (response.statusCode === 200) {
            return callback(null, body);
          } else {
            sails.log.error(body);
            return callback(Utils.error('easemob_error'));
          }
        });
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.result);
  });
}

/**
 * 注册环信用户
 * @param {UserEaseMob}   uEobj 用户对象
 * @param {Function} callback 回调函数
 */
exports.createUser = function(uEobj, callback) {
  sendRequest('post', 'users', {
    username: uEobj.id,
    nickname: uEobj.nickname,
    password: uEobj.password
  }, callback);
};

/**
 * 更新昵称
 * @param {UserEaseMob}   uEobj 用户对象
 * @param {Function} callback 回调函数
 */
exports.updateNickname = function(uEobj, callback) {
  sendRequest('put', 'users/' + uEobj.id, {
    nickname: uEobj.nickname
  }, callback);
};

/**
 * 创建群组
 * @param {string}   name     群组名
 * @param {string}   desc     群组描述
 * @param {integer}   maxuser  最大人数
 * @param {Boolean}  isPublic 是否公开群
 * @param {Boolean}   invite   是否允许成员邀请
 * @param {Boolean}   approval 是否需要批准
 * @param {string}   owner    群主ID
 * @param {Function} callback 回调函数
 */
exports.createGroup = function(
  name, desc, maxuser, isPublic, invite, approval, owner, callback
) {
  sendRequest(
    'post',
    'chatgroups', {
      'groupname': name, // 群组名称, 此属性为必须的
      'desc': desc, // 群组描述, 此属性为必须的
      'public': isPublic, // 是否是公开群, 此属性为必须的，当前版本不可修改
      'maxusers': maxuser, // 群组成员最大数(包括群主), 值为数值类型,默认值200,此属性为可选的
      'allowinvites': invite, // 是否允许成员邀请，当前版本不可修改
      'approval': approval, // 加入公开群是否需要批准, 默认值是true（加群需要群主批准）, 当前版本不可修改
      'owner': owner // 群组的管理员, 此属性为必须的
      // 'members': ['jma2', 'jma3'] // 群组成员,此属性为可选的,但是如果加了此项,数组元素至少一个（注：群主jma1不需要写入到members里面）
    },
    function(err, result) {
      if (err) {
        return callback(err);
      }
      return callback(null, result.data);
    });
};

/**
 * 更新群组信息
 * @param {string}   groupId  群组ID
 * @param {string}   name     群组名
 * @param {string}   desc     群组描述
 * @param {integer}   maxusers 最大用户数
 * @param {Function} callback 回调函数
 */
exports.updateGroup = function(groupId, name, desc, maxusers, callback) {
  sendRequest(
    'put',
    'chatgroups/' + groupId, {
      'groupname': name, // 群组名称
      'description': desc, // 群组描述
      'maxusers': maxusers // 群组成员最大数(包括群主), 值为数值类型
    }, callback);
};

/**
 * 加入群组
 * @param {string}   userId   用户ID
 * @param {string}   groupId  群组ID
 * @param {Function} callback 回调函数
 */
exports.joinGroup = function(userId, groupId, callback) {
  sendRequest(
    'post',
    'chatgroups/' + groupId + '/users/' + userId,
    callback
  );
};

/**
 * 退出群组
 * @param {string}   userId   用户ID
 * @param {string}   groupId  群组ID
 * @param {Function} callback 回调函数
 */
exports.leaveGroup = function(userId, groupId, callback) {
  sendRequest(
    'delete',
    'chatgroups/' + groupId + '/users/' + userId,
    callback
  );
};

/**
 * 获取token
 */
exports.getToken = function(cb) {
  async.auto({
    exists: function existsFn(callback) {
      Cache.exists(Constant.IMToken, callback);
    },
    token: ['exists',
      function tokenFn(callback, result) {
        if (result.exists) {
          sails.log.verbose('EaseMob Token Exists');
          return callback(null, null);
        }

        sendRequest('post', 'token', {
            'grant_type': 'client_credentials',
            'client_id': process.env.EASEMOB_ID,
            'client_secret': process.env.EASEMOB_SECRET
          },
          function(err, token) {
            if (err) {
              return callback(err);
            }
            Cache.set(Constant.IMToken, token.access_token, token.expires_in);
            sails.log.verbose('Get EaseMob Token Success');
            if (callback) {
              return callback(null, null);
            }
          });
      }
    ]
  }, function(err) {
    if (err) {
      return cb(err);
    }
    return cb(null, null);
  });
};
