'use strict';

var crypto = require('crypto');

/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uid(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */
exports.uid = function(len) {
  var buf = [],
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    charlen = chars.length;

  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
};

/**
 * 短随机ID
 * @param  {integer} len 长度
 */
exports.uidLight = function(len) {
  var buf = [],
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    charlen = chars.length;

  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
};

/**
 * 获取两个坐标之间的距离
 * @param  {float}      lat1     纬度1
 * @param  {float}      lon1     经度1
 * @param  {float}      lat2     纬度2
 * @param  {float}      lon2     经度2
 * @param  {integer}    decimals 精度
 * @param  {Function}   callback 回调函数
 */
exports.getDistance = function(lat1, lon1, lat2, lon2, decimals, callback) {
  if (_.isFunction(decimals)) {
    callback = decimals;
    decimals = 0;
  }
  var sql = `select round((point(${lat1}, ${lon1}) <@> point(${lat2},
    ${lon2}))::numeric * 1600, ${decimals}) as distance`;
  Venue.query(sql, function(err, result) {
    if (err) {
      callback(err, 0);
    }

    return callback(null, +(result.rows[0].distance));
  });
};

/**
 * 返回错误
 * @param  {integer}   message 描述
 */
exports.error = function(message) {
  var err = new Error();
  err.message = message;
  return err;
};

/**
 * 加密函数
 * @param  {string} str    被加密的字符串
 * @param  {string} secret 加密的key
 * @return {string}        加密后的字符串
 */
exports.encrypt = function(str, secret) {
  var cipher = crypto.createCipher('aes-128-ecb', secret);
  var enc = cipher.update(str, 'utf8', 'hex');
  enc += cipher.final('hex');
  return enc;
};

/**
 * 解密函数
 * @param  {string} str    加密后的字符串
 * @param  {string} secret 解密的key
 * @return {string}        解密后的字符串
 */
exports.decrypt = function(str, secret) {
  var decipher = crypto.createDecipher('aes-128-ecb', secret);
  var dec = decipher.update(str, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
};

exports.randomCode = function(length) {
  var max = parseInt(`1${Array(length).fill(0).join('')}`),
    min = 1,
    code = Math.floor(Math.random() * (max - min)) + min;

  if (code < (max / 10) || code > max) {
    return Utils.randomCode(length);
  }
  return code;
};

/**
 * Return a random int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
