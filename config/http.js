/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * Only applies to HTTP requests (not WebSockets)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.http.html
 */
'use strict';
module.exports.http = {
  middleware: {
    order: [
      'startRequestTimer',
      // 'cookieParser',
      'session',
      'myRequestLogger',
      'bodyParser',
      'handleBodyParserError',
      'compress',
      'methodOverride',
      'poweredBy',
      '$custom',
      'router',
      // 'www',
      // 'favicon',
      '404',
      '500'
    ],

    myRequestLogger: function(req, res, next) {
      sails.log(`Requested :: ${req.method} ${req.url}`);
      return next();
    },

    poweredBy: function xPoweredBy(req, res, next) {
      res.header('X-Powered-By', 'Let\'s Do Sports <letsdosports.com>');
      next();
    },

    startRequestTimer: function startRequestTimer(req, res, next) {
      req.startTime = new Date();
      next();
    }
  }
};
