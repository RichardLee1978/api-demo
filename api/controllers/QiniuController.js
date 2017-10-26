/**
 * QiniuController
 *
 * @description :: 七牛相关
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
'use strict';

module.exports = {
  /**
   * 请求生成上传token
   * @URL   get /v1/info/qiniu/:type
   */
  uploadToken: function(req, res) {
    var type = req.param('type'),
      user = req.user,
      position = req.param('position') || 0,
      userId = user ? user.id : '';

    position = +position > Constant.maxVideoUploadLength - 1
              ? Constant.maxVideoUploadLength - 1
              : +position;

    if (!_.contains(['video', 'avatar', 'picture', 'sound'], type)) {
      return res.badRequest(400001);
    }

    if (type === 'video' && !userId) {
      return res.unauthorized();
    }

    Qiniu.token(userId, type, position, function(err, results) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(results);
    });
  }
};
