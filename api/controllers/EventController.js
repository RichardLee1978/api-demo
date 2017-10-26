/**
 * EventController
 *
 * @description :: 项目相关
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
'use strict';

exports.eventDetail = function(req, res) {
  var eventId = req.param('eventId');

  WebService.eventDetail(eventId, function(err, detail) {
    if (err) {
      return res.returnError(err);
    }
    return res.data(detail);
  });
};

exports.createEvent = function(req, res) {
  var eventObj = {
    venue: req.param('venueId'),
    category: req.param('category'),
    phone: req.param('phone') || '',
    volume: req.param('volume') || '',
    description: req.param('description') || '',
    planType: req.param('planType') || 'ground',
    planLength: req.param('planLength') || 1,
    planPrice: req.param('planPrice') || 0,
    attention: req.param('attention') || '',
    opentime: req.param('opentime') || '0900',
    closetime: req.param('closetime') || '2200',
    displayOrder: req.param('displayOrder') || 100
  };

  if (!eventObj.category) {
    return res.badRequest(400001);
  }

  WebService.createEvent(eventObj, function(err, result) {
    if (err) {
      return res.returnError(err);
    }
    return res.data(result);
  });
};

exports.updateEvent = function(req, res) {
  var eventId = req.param('eventId');
  var eventObj = {};

  if (req.param('category')) {
    eventObj.category = req.param('category');
  }
  if (req.param('phone')) {
    eventObj.phone = req.param('phone');
  }
  if (req.param('volume')) {
    eventObj.volume = req.param('volume');
  }
  if (req.param('description')) {
    eventObj.description = req.param('description');
  }
  if (req.param('planType')) {
    eventObj.planType = req.param('planType');
  }
  if (req.param('planLength')) {
    eventObj.planLength = req.param('planLength');
  }
  if (req.param('planPrice')) {
    eventObj.planPrice = req.param('planPrice');
  }
  if (req.param('attention')) {
    eventObj.attention = req.param('attention');
  }
  if (req.param('opentime')) {
    eventObj.opentime = req.param('opentime');
  }
  if (req.param('closetime')) {
    eventObj.closetime = req.param('closetime');
  }
  if (req.param('displayOrder')) {
    eventObj.displayOrder = req.param('displayOrder');
  }
  if (req.param('enabled')) {
    eventObj.enabled = req.param('enabled');
  }

  WebService.updateEvent(eventId, eventObj, function(err, result) {
    if (err) {
      return res.returnError(err);
    }
    return res.data(result);
  });
};

exports.updateEventDisplayOrder = function(req, res) {
  var eventOrderObj = req.param('eventOrderObj') ? req.param('eventOrderObj') : [];

  if (_.isEmpty(eventOrderObj)) {
    return res.badRequest(400001);
  }

  WebService.updateEventDisplayOrder(eventOrderObj, function(err, result) {
    if (err) {
      return res.returnError(err);
    }
    return res.data(result);
  });
};
