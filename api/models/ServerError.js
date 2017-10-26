/**
 * ServerError.js
 *
 * @description :: 纪录服务器错误
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  schema: true,
  autoPK: false,

  attributes: {
    id: {
      type: 'string',
      primaryKey: true
    },
    user: {
      type: 'json',
      defaultsTo: {}
    },
    client: {
      type: 'json',
      defaultsTo: {}
    },
    method: 'string',
    status: 'integer',
    url: 'string',
    auth: 'string',
    reqobj: 'json',
    error: 'json',
    fix: 'boolean'
  }
};
