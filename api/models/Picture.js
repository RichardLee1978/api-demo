/**
 * Picture.js
 *
 * @description :: 图片类
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
'use strict';
module.exports = {
  schema: true,
  autoPK: false,

  attributes: {
    id: {
      type: 'string',
      primaryKey: true
    },
    // 类型
    type: {
      type: 'string',
      defaultsTo: ''
    },
    // 子类型
    subtype: {
      type: 'string',
      defaultsTo: ''
    },
    // 对象ID
    object: {
      type: 'string',
      defaultsTo: ''
    },
    // 排列顺序
    displayOrder: {
      type: 'integer',
      defaultsTo: 100
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    // 是否删除
    deleted: {
      type: 'boolean',
      defaultsTo: false
    },
    // 路径
    path: {
      type: 'string',
      defaultsTo: ''
    }
  },
  getVenuePictures: function(opts, callback) {
    if (opts.id) {
      getbyId('venue', opts.id, callback);
    } else {
      getbyIds('venue', opts.ids, callback);
    }
  }
};

function getbyIds(type, ids, callback) {
  var squel = require('squel').useFlavour('postgres');

  var query = squel.select().from('picture')
    .field('object')
    .field('subtype')
    .field('array_to_string(array_agg("path" order by "displayOrder"), \', \')',
      'paths')
    .where('type = ? and enabled = true and object in ?', type, ids)
    .group('object')
    .group('subtype');
  Picture.query(query.toString(), function(err, results) {
    if (err) {
      return callback(err);
    }
    if (_.isEmpty(results.rows)) {
      return callback(null, {});
    }
    var picObj = {};
    results = results.rows;
    async.eachSeries(ids, function(id, eachCB) {
      var innerobj = {};
      if (!picObj[id]) {
        innerobj = picObj[id] = {};
      } else {
        innerobj = picObj[id];
      }
      innerobj.thumb = _.result(_.find(results, {
        'subtype': 'thumb',
        'object': id
      }), 'paths', '');
      innerobj.detail = (_.result(_.find(results, {
        'subtype': 'detail',
        'object': id
      }), 'paths', '')).split(',');
      eachCB(null, null);
    }, function(error) {
      return callback(error, picObj);
    });
  });
}

function getbyId(type, id, callback) {
  var squel = require('squel').useFlavour('postgres');

  var query = squel.select().from('picture')
    .field('object')
    .field('subtype')
    .field('array_to_string(array_agg("path" order by "displayOrder"), \', \')',
      'paths')
    .where('type = ? and enabled = true and object = ?', type, id)
    .group('object')
    .group('subtype');
  Picture.query(query.toString(), function(err, results) {
    if (err) {
      return callback(err);
    }
    if (_.isEmpty(results.rows)) {
      return callback(null, {});
    }
    results = results.rows;
    var picObj = {};
    picObj.thumb = _.result(_.find(results, {
      'subtype': 'thumb'
    }), 'paths', '');
    picObj.detail = (_.result(_.find(results, {
      'subtype': 'detail'
    }), 'paths', '')).split(',');
    return callback(null, picObj);
  });
}
