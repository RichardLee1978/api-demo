/**
 * AccessLog.js
 *
 * @description :: 纪录访问记录
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
    user: 'string',
    client: 'string',
    method: 'string',
    status: 'integer',
    url: 'string',
    reqobj: 'json',
    processtime: 'integer'
  }
};
