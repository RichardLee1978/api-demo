'use strict';

var oauth2orize = require('oauth2orize'),
  bcrypt = require('bcrypt'),
  passport = require('passport'),
  OAuthProtect = require('../api/policies/oAuthProtect.js'),
  thirdPartyProtect = require('../api/policies/thirdPartyProtect.js');

// 创建 OAuth 2.0 服务器
var server = oauth2orize.createServer();

server.serializeClient(function(client, done) {
  return done(null, client.id);
});

server.deserializeClient(function(id, done) {
  Client.findOne(id, function(err, client) {
    if (err) {
      return done(err);
    }
    return done(null, client);
  });
});

function thirdPartyLogin(type, id, scope, client, done) {
  async.auto({
    userId: function userIdFn(callback) {
      UserExtra.getUserIdWithThirdParty(type, id, function(err, userId) {
        if (err) {
          return callback(err);
        }
        return callback(null, userId);
      });
    },
    updateClient: [
      'userId',
      function updateClientFn(callback, result) {
        Client.update({
          clientId: client.clientId
        }, {
          userId: result.userId
        }).exec(callback);
      }
    ],
    updateUserExtra: [
      'updateClient',
      function updateUserExtraFn(callback, result) {
        UserExtra.update(result.userId, {
          lastlogin: new Date(),
          lastActivity: new Date()
        }).exec(callback);
      }
    ],
    destroyRefreshToken: [
      'userId',
      function destroyRefreshTokenFn(callback, result) {
        RefreshToken.destroy({
          userId: result.userId,
          clientId: client.clientId
        }).exec(callback);
      }
    ],
    destroyAccessToken: [
      'userId',
      function destroyAccessTokenFn(callback, result) {
        AccessToken.destroy({
          userId: result.userId,
          clientId: client.clientId
        }).exec(callback);
      }
    ],
    createRefreshToken: [
      'userId',
      'destroyRefreshToken',
      function createRefreshTokenFn(callback, result) {
        RefreshToken.create({
          userId: result.userId,
          clientId: client.clientId
        }).exec(callback);
      }
    ],
    createAccessToken: [
      'userId',
      'destroyAccessToken',
      function createAccessTokenFn(callback, result) {
        AccessToken.create({
          userId: result.userId,
          clientId: client.clientId,
          scope: scope.join(' ')
        }).exec(callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return done(err);
    }

    return done(null,
      results.createAccessToken.token,
      results.createRefreshToken.token, {
        'expires_in': sails.config.oauth.tokenLife
      });
  });
}

// Client Credentials 授权
server.exchange(oauth2orize.exchange.clientCredentials(function(client, scope,
  done) {
  var resources = [
    'userclientresource',
    'coachclientresource',
    'webclientresource'
  ];
  if (scope.length !== 1 || !_.contains(resources, scope[0])) {
    return done({
      status: Constant.forbidden,
      message: 'client_permission_scope_error'
    });
  }
  async.auto({
    destroyAccessToken: function destroyAccessToken(callback) {
      AccessToken.destroy({
        clientId: client.clientId
      }).exec(callback);
    },
    createAccessToken: [
      'destroyAccessToken',
      function createAccessToken(callback) {
        AccessToken.create({
          clientId: client.clientId,
          scope: scope
        }).exec(callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return done(err);
    }

    return done(null, results.createAccessToken.token);
  });
}));

// 用用户名密码来交换 AccessToken
server.exchange(oauth2orize.exchange.password(function(client, username,
  password, scope, done) {
  if (_.contains(Constant.thirdPartyAccountType, username)) {
    return thirdPartyLogin(username, password, scope, client, done);
  }

  async.auto({
    user: function userFn(callback) {
      User.findOneByUsername(username).exec(function(err, user) {
        if (err) {
          return callback(err);
        }
        if (!user) {
          return callback(Utils.error(403002));
        }
        return callback(null, user);
      });
    },
    verify: [
      'user',
      function verifyFn(callback, result) {
        if (scope !== 'coachresource') {
          return callback(null, true);
        }
        if (!result.user.verifyCoach) {
          return callback(Utils.error(403007));
        }
        return callback(null, true);
      }
    ],
    compare: [
      'user',
      'verify',
      function compareFn(callback, result) {
        bcrypt.compare(password, result.user.password, function(err, valid) {
          if (err) {
            return callback(err);
          }
          if (!valid) {
            return callback(Utils.error(403003));
          }

          return callback(null, true);
        });
      }
    ],
    updateClient: [
      'compare',
      function updateClientFn(callback, result) {
        Client.update({
          clientId: client.clientId
        }, {
          userId: result.user.id
        }).exec(callback);
      }
    ],
    updateUserExtra: [
      'updateClient',
      function updateUserExtraFn(callback, result) {
        UserExtra.update(result.user.id, {
          lastlogin: new Date(),
          lastActivity: new Date()
        }).exec(callback);
      }
    ],
    destroyRefreshToken: [
      'compare',
      function destroyRefreshTokenFn(callback, result) {
        RefreshToken.destroy({
          userId: result.user.id,
          clientId: client.clientId
        }).exec(callback);
      }
    ],
    destroyAccessToken: [
      'compare',
      function destroyAccessTokenFn(callback, result) {
        AccessToken.destroy({
          userId: result.user.id,
          clientId: client.clientId
        }).exec(callback);
      }
    ],
    createRefreshToken: [
      'compare',
      'destroyRefreshToken',
      function createRefreshTokenFn(callback, result) {
        RefreshToken.create({
          userId: result.user.id,
          clientId: client.clientId
        }).exec(callback);
      }
    ],
    createAccessToken: [
      'compare',
      'destroyAccessToken',
      function createAccessTokenFn(callback, result) {
        AccessToken.create({
          userId: result.user.id,
          clientId: client.clientId,
          scope: scope.join(' ')
        }).exec(callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return done(err);
    }

    return done(null,
      results.createAccessToken.token,
      results.createRefreshToken.token, {
        'expires_in': sails.config.oauth.tokenLife
      });
  });
}));

// 用 refreshToken 交换 access token.
server.exchange(oauth2orize.exchange.refreshToken(function(client,
  refreshToken, scope, done) {
  async.auto({
    token: function token(callback) {
      RefreshToken.findOneByToken(refreshToken).exec(callback);
    },
    user: [
      'token',
      function(callback, result) {
        if (!result.token) {
          return callback(null, false);
        }
        User.findOne(result.token.userId).exec(callback);
      }
    ],
    destroyRefreshToken: [
      'user',
      function destroyRefreshToken(callback, result) {
        RefreshToken.destroy({
          userId: result.user.id,
          clientId: client.clientId
        }).exec(callback);
      }
    ],
    destroyAccessToken: [
      'user',
      function destroyAccessToken(callback, result) {
        AccessToken.destroy({
          userId: result.user.id,
          clientId: client.clientId
        }).exec(callback);
      }
    ],
    createRefreshToken: [
      'user',
      'destroyRefreshToken',
      function createRefreshToken(callback, result) {
        if (!result.user) {
          return callback(null, false);
        }

        RefreshToken.create({
          userId: result.user.id,
          clientId: client.clientId
        }).exec(callback);
      }
    ],
    createAccessToken: [
      'user',
      'destroyAccessToken',
      function createAccessToken(callback, result) {
        if (!result.user) {
          return callback(null, false);
        }

        AccessToken.create({
          userId: result.user.id,
          clientId: client.clientId,
          scope: scope.join(' ')
        }).exec(callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return done(err);
    }
    if (!results.token) {
      return done(Utils.error(403004));
    }
    if (!results.user) {
      return done(Utils.error(403002));
    }

    return done(null,
      results.createAccessToken.token,
      results.createRefreshToken.token, {
        'expires_in': sails.config.oauth.tokenLife
      });
  });
}));

module.exports = {
  http: {
    customMiddleware: function(app) {
      app.use(passport.initialize());
      app.use(passport.session());

      app.post('/oauth/token',
        OAuthProtect,
        passport.authenticate(
          ['clientBasic', 'clientPassword'], {
            session: false
          }
        ),
        server.token(),
        server.errorHandler()
      );
      app.post('/oauth/thirdParty',
        thirdPartyProtect,
        passport.authenticate('thirdParty', {
          session: false
        }),
        server.token(),
        server.errorHandler()
      );
      app.post('/oauth/coach',
        OAuthProtect,
        passport.authenticate('coachLogin', {
          session: false
        }),
        server.token(),
        server.errorHandler()
      );
    }
  }
};
