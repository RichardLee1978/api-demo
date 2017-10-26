/**
* ObjectCache.js
*
* @description :: 对象缓存类
* @docs        :: http://sailsjs.org/#!documentation/models
*/
'use strict';

module.exports = {
  connection: 'redis',
  schema: true,

  attributes: {
    type: 'string',
    data: 'json'
  },
  afterUpdate: function(values, next) {
    ObjectTime.update({
      type: values.type
    }, {
      lastupdate: values.updatedAt
    }).exec(next);
  },
  afterCreate: function(values, next) {
    ObjectTime.findOneByType(values.type).exec(function(err, obj) {
      if (err) {
        return next(err);
      }
      if (obj) {
        obj.lastupdate = values.updatedAt;
        obj.save(next);
      }else {
        ObjectTime.create({
          type: values.type,
          lastupdate: values.updatedAt
        }).exec(next);
      }
    });
  }
};
