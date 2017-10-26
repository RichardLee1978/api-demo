'use strict';

var moment = require('moment'),
  passport = require('passport'),
  BasicStrategy = require('passport-http').BasicStrategy,
  ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
  BearerStrategy = require('passport-http-bearer').Strategy,
  CustomStrategy = require('passport-custom').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOne(id).exec(function(err, user) {
    done(err, user);
  });
});

function processClient(clientId, clientSecret, done) {
  Client.findOneByClientId(clientId).exec(function(err, client) {
    if (err) {
      return done(err);
    }
    var message = '';
    if (!client || client.clientSecret !== clientSecret) {
      message = 'client_is_unavailable';
    } else if (!client.trusted) {
      message = 'client_is_untrusted';
    }
    if (!message) {
      return done(null, client);
    } else {
      return done({
        status: Constant.forbidden,
        message: message
      }, false);
    }
  });
}

passport.use('clientBasic', new BasicStrategy(function(clientId, clientSecret, done) {
  processClient(clientId, clientSecret, done);
}));

passport.use('clientPassword', new ClientPasswordStrategy(function(clientId, clientSecret, done) {
  processClient(clientId, clientSecret, done);
}));

passport.use('coachLogin', new CustomStrategy(function(req, done) {
  var scope = req.param('scope'),
    auth = require('basic-auth'),
    clientInfo = auth(req);

  async.auto({
    client: function clientFn(callback) {
      return processClient(clientInfo.name, clientInfo.pass, callback);
    },
    info: [
      'client',
      function infoFn(callback, result) {
        return callback(null, {
          scope: scope,
          client: result.client
        });
      }
    ]
  }, function(err, results) {
    if (err) {
      return done(err);
    }
    return done(null, results.client, results.info);
  });
}));

passport.use('thirdParty', new CustomStrategy(function(req, done) {
  var type = req.param('type'),
    id = req.param('id'),
    scope = req.param('scope'),
    auth = require('basic-auth'),
    clientInfo = auth(req);

  async.auto({
    client: function clientFn(callback) {
      return processClient(clientInfo.name, clientInfo.pass, callback);
    },
    decryptId: [
      'client', function decryptIdFn(callback, result) {
        var clientId = result.client.clientId;
        var newId = Utils.decrypt(id, clientId);
        return callback(null, newId);
      }
    ],
    user: [
      'decryptId', function userFn(callback, result) {
        UserExtra.getUserIdWithThirdParty(type, result.decryptId, function(err, userId) {
          if (err) {
            return callback(err);
          }
          User.findOne(userId).exec(function(error, user) {
            if (error) {
              return callback(error);
            }
            if (!user) {
              return callback(Utils.error(403002));
            }
            return callback(null, user);
          });
        });
      }
    ],
    info: [
      'user', 'client', function infoFn(callback, result) {
        return callback(null, {
          scope: scope,
          client: result.client
        });
      }
    ]
  }, function(err, results) {
    if (err) {
      return done(err);
    }
    req.body.username = type;
    req.body.password = results.decryptId;
    return done(null, results.info.client, results.info);
  });
}));

passport.use('bearer', new BearerStrategy(function(accessToken, done) {
  async.auto({
    token: function tokenFn(callback) {
      AccessToken.findOneByToken(accessToken).exec(callback);
    },
    checkToken: [
      'token', function checkTokenFn(callback, result) {
        if (!result.token) {
          return callback(Utils.error(403002));
        }

        var now = moment().unix();
        var creationDate = moment(result.token.createdAt).unix();

        if (now - creationDate > sails.config.oauth.tokenLife) {
          AccessToken.destroy({
            token: accessToken
          }).exec(function(err) {
            if (err) {
              return callback(err);
            }
            return callback(Utils.error(403002));
          });
        } else {
          return callback(null, false);
        }
      }
    ],
    client: [
      'checkToken', function clientFn(callback, result) {
        if (result.checkToken) {
          return callback(null, null);
        }
        Client.findOneByClientId(result.token.clientId).exec(function(err, client) {
          if (err) {
            return callback(err);
          }
          var code = 0;
          if (!client) {
            code = 403006;
          } else if (!client.trusted) {
            code = 403007;
          }
          if (!code) {
            return callback(null, client);
          } else {
            return callback(Utils.error(code));
          }
        });
      }
    ],
    user: [
      'checkToken', function userFn(callback, result) {
        if (result.checkToken) {
          return callback(null, null);
        }

        if (!result.token.userId) {
          return callback(null, {});
        }

        User.findOne(result.token.userId).exec(function(err, user) {
          if (err) {
            return callback(err);
          }
          if (!user) {
            return callback(Utils.error(403002));
          }
          return callback(null, user);
        });
      }
    ],
    info: [
      'checkToken', 'client', function infoFn(callback, result) {
        if (result.checkToken) {
          return callback(null, null);
        }
        return callback(null, {
          scope: result.token.scope,
          client: result.client
        });
      }
    ]
  }, function(err, results) {
    if (err) {
      return done(err);
    }
    if (!results.token) {
      return done(null, false);
    }
    return done(null, results.user, results.info);
  });
}));
