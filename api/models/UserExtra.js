/**
 * UserExtra.js
 *
 * @description :: 用户扩展信息类
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
'use strict';

function buildThirdPartySQL(type, id) {
  var squel = require('squel').useFlavour('postgres');
  var v = squel.select({
    tableAliasQuoteCharacter: '"',
    nameQuoteCharacter: '"',
    autoQuoteTableNames: true
  });
  var idName = '';
  if (type === 'sina') {
    idName = 'uid';
  }

  v.from('userextra', 'ue')
    .join('user', 'u', 'u.id = ue.id')
    .where('u.enabled = true');

  switch (type) {
    case 'sina':
      v.where(`ue."thirdParty" #> '{${type}}' ->> '${idName}' = '${id}'`);
      break;
    case 'wechat':
      v.where(
        `ue."thirdParty" #> '{${type}}' ->> 'openId' = '${id}' OR
         ue."thirdParty" #> '{${type}}' ->> 'unionId' = '${id}'`
      );
      break;
  }

  v.field('ue.id');

  return v.toString();
}

module.exports = {
  schema: true,
  autoPK: false,

  attributes: {
    id: {
      type: 'string',
      primaryKey: true
    },
    // 状态
    status: {
      type: 'string',
      defaultsTo: ''
    },
    // 积分
    score: {
      type: 'integer',
      defaultsTo: 0
    },
    // 纬度
    latitude: {
      type: 'float',
      defaultsTo: 0
    },
    // 经度
    longitude: {
      type: 'float',
      defaultsTo: 0
    },
    // ip
    ip: {
      type: 'string',
      defaultsTo: ''
    },
    // 最后登录
    lastlogin: 'datetime',
    // 最后活动
    lastActivity: 'datetime',
    // 朋友数
    friends: {
      type: 'integer',
      defaultsTo: 0
    },
    // 粉丝数
    fans: {
      type: 'integer',
      defaultsTo: 0
    },
    // 群组数
    groups: {
      type: 'integer',
      defaultsTo: 0
    },
    // 是否附近的人可见
    atNearby: {
      type: 'boolean',
      defaultsTo: true
    },
    // 第三方账号信息
    thirdParty: {
      type: 'json',
      defaultsTo: {}
    },
    // 最后订单联系人信息
    lastContact: {
      type: 'json',
      defaultsTo: {}
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.id;
      delete obj.ip;
      delete obj.latitude;
      delete obj.longitude;
      delete obj.createdAt;
      delete obj.updatedAt;
      obj.linkWeChat = _.has(obj.thirdParty, 'wechat');
      obj.linkSina = _.has(obj.thirdParty, 'sina');
      return obj;
    }
  },

  checkThirdPartyLinked: function(type, id, createLink, userId, cb) {
    var sql = buildThirdPartySQL(type, id);

    UserExtra.query(sql, function(err, result) {
      if (err) {
        return cb(err);
      }
      result = result.rows.pop();

      var error = null;
      // 如果是第一次绑定，不能被其他账号绑定
      // 如果是更新绑定信息，不能绑定了其他账号
      if (
        (createLink && !_.isEmpty(result)) ||
        (!createLink && (!_.isNull(userId) && result && result.id !== userId))
      ) {
        error = Utils.error(400036);
      } else if (!_.isEmpty(result)) {
        error = Utils.error(400035);
      }
      if (error) {
        return cb(error);
      }
      return cb(null, null);
    });
  },

  getUserIdWithThirdParty: function(type, id, cb) {
    var sql = buildThirdPartySQL(type, id);

    UserExtra.query(sql, function(err, result) {
      if (err) {
        return cb(err);
      }
      result = result.rows.pop();

      if (_.isEmpty(result)) {
        return cb(Utils.error(400035));
      }
      return cb(null, result.id);
    });
  }
};
