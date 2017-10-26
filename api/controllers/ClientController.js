/**
 * ClientController
 *
 * @description :: 客户端相关
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
'use strict';

module.exports = {
  create: function(req, res) {
    var type = req.param('type') || '',
      deviceName = req.param('deviceName') || '',
      deviceVersion = req.param('deviceVersion') || '',
      deviceOsVersion = req.param('deviceOsVersion') || '',
      deviceIdentify = req.param('deviceIdentify') || '',
      version = req.param('version') || '',
      redirectURI = req.param('redirectURI') || '';

    if (_.isEmpty(type) || _.isEmpty(deviceName) || _.isEmpty(deviceVersion) ||
      _.isEmpty(deviceOsVersion) || _.isEmpty(deviceIdentify) ||
      _.isEmpty(version) || _.isEmpty(redirectURI)) {

      return res.badRequest(400001);
    }

    var client = {
      type: type,
      deviceName: deviceName,
      deviceVersion: deviceVersion,
      deviceOsVersion: deviceOsVersion,
      deviceIdentify: deviceIdentify,
      version: version,
      redirectURI: redirectURI
    };

    Client.create(client).exec(function(err, cl) {
      if (err) {
        return res.returnError(err);
      }

      res.data({
        'client_id': cl.clientId,
        'client_secret': cl.clientSecret
      });
    });
  },

  update: function(req, res) {
    var deviceName = req.param('deviceName') || '',
      deviceOsVersion = req.param('deviceOsVersion') || '',
      version = req.param('version') || '';

    if (_.isEmpty(deviceName) && _.isEmpty(deviceOsVersion) && _.isEmpty(
        version)) {
      return res.badRequest(400001);
    }

    Client.findOneByClientId(req.client.clientId).exec(function(err, cl) {
      if (err) {
        return res.returnError(err);
      }
      if (deviceName) {
        cl.deviceName = deviceName;
      }
      if (deviceOsVersion) {
        cl.deviceOsVersion = deviceOsVersion;
      }
      if (version) {
        cl.version = version;
      }

      cl.save(function() {
        res.data({});
      });
    });
  }
};
