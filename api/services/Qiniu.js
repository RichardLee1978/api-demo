'use strict';

var qiniu = require('qiniu'),
  moment = require('moment'),
  bucket = 'woola';

/**
 * 七牛下发上传token生成方式
 * @param  {string}     userId   当前用户ID
 * @param  {string}     type     上传类型
 * @param  {integer}    position 视频截图位置
 * @param  {Function}   cb       回调函数
 * @return {string}              上传token
 */
exports.token = function(userId, type, position, cb) {
  var policy = {},
    endDate = moment().add(1, 'days').endOf('day'),
    expire = endDate.unix() - moment().unix();

  function uptoken(_policy, callback) {
    if (!_policy.scope) {
      return callback(new Error('Does not have qiniu upload policy scope'));
    }
    qiniu.conf.ACCESS_KEY = process.env.QINIU_AK;
    qiniu.conf.SECRET_KEY = process.env.QINIU_SK;

    var putPolicy = new qiniu.rs.PutPolicy2(_policy);
    var token = putPolicy.token();

    return callback(null, token);
  }

  policy.scope = bucket;
  policy.expires = expire;

  var ops = '';
  var returnBody = {};
  var time = moment().unix();
  var datestr = moment().format('YYYYMMDD');

  switch (type) {
    case 'avatar':
      break;
    case 'video':
      var videopath = `post/video/${datestr}/${userId}-${time}.mp4`;
      var snapshotpath = `post/video/${datestr}/${userId}-${time}-snapshot.jpg`;

      returnBody.videopath = videopath;

      videopath = new Buffer(bucket + ':' + videopath).toString('base64');
      snapshotpath = new Buffer(bucket + ':' + snapshotpath).toString('base64');

      ops = `avthumb/mp4/ss/0/t/${Constant.maxVideoUploadLength}
              /s/480x360/autoscale/1|saveas/${videopath};`;
      ops += `vframe/jpg/offset/${position}/w/480/h/360|saveas/${snapshotpath}`;
      break;
    case 'picture':
      break;
    case 'sound':
      break;
  }

  if (ops !== '') {
    policy.persistentOps = ops;
  }

  if (!_.isEmpty(returnBody)) {
    policy.returnBody = returnBody;
    policy.returnBody = JSON.stringify(policy.returnBody);
  }

  async.auto({
    token: function tokenFn(callback) {
      uptoken(policy, callback);
    },
    expiresAt: function expiresAtFn(callback) {
      callback(null, endDate.unix());
    },
    time: function timeFn(callback) {
      callback(null, time);
    }
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results);
  });
};
