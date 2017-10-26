/**
 * TicketController
 *
 * @description :: 票务相关
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
'use strict';

module.exports = {
  createTicketPresetWithEvent: function(req, res) {
    var preset = {
      event: req.param('event'),
      title: req.param('title'),
      attention: req.param('attention'),
      week: req.param('week') || '1234560',
      date: req.param('date') || '',
      beginTime: req.param('beginTime') || 0,
      endTime: req.param('endTime') || 0,
      normalPrice: req.param('normalPrice') || 0,
      promotionPrice: req.param('promotionPrice'),
      quantity: req.param('quantity')
    };

    if (!preset.event || !preset.promotionPrice) {
      return res.badRequest(400001);
    }

    async.auto({
      check: function checkFn(callback) {
        TicketPreset.count({
          event: preset.event,
          week: preset.week,
          date: preset.date,
          beginTime: preset.beginTime,
          endTime: preset.endTime
        }).exec(function(err, count) {
          if (err) {
            return callback(err);
          }
          if (count) {
            return callback(Utils.error('同一时间段的项目票务预设已经存在'));
          }
          return callback(null, null);
        });
      },
      create: [
        'check',
        function createFn(callback) {
          TicketPreset.create(preset).exec(callback);
        }
      ]
    }, function(err, results) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(results.create);
    });
  }
};
