/**
 * GroundController
 *
 * @description :: 场地相关
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
'use strict';

exports.groundDetail = function(req, res) {
  var groundId = req.param('groundId');

  WebService.groundDetail(groundId, function(err, detail) {
    if (err) {
      return res.returnError(err);
    }
    return res.data(detail);
  });
};

exports.createGround = function(req, res) {
  var groundObj = {
    event: req.param('eventId'),
    displayOrder: req.param('displayOrder') || 1,
    name: req.param('name') || '',
    volume: req.param('volume') || '',
    description: req.param('description') || ''
  };

  if (!groundObj.event) {
    return res.badRequest(400001);
  }

  WebService.createGround(groundObj, function(err, result) {
    if (err) {
      return res.returnError(err);
    }
    return res.data(result);
  });
};

exports.updateGround = function(req, res) {
  var groundId = req.param('groundId');
  var groundObj = {};

  if (req.param('displayOrder')) {
    groundObj.displayOrder = req.param('displayOrder');
  }
  if (req.param('name')) {
    groundObj.name = req.param('name');
  }
  if (req.param('volume')) {
    groundObj.volume = req.param('volume');
  }
  if (req.param('description')) {
    groundObj.description = req.param('description');
  }
  if (req.param('enabled')) {
    groundObj.enabled = req.param('enabled');
  }

  WebService.updateGround(groundId, groundObj, function(err, result) {
    if (err) {
      return res.returnError(err);
    }
    return res.data(result);
  });
};

exports.updateGroundDisplayOrder = function(req, res) {
  var groundOrderObj = req.param('groundOrderObj') ? req.param('groundOrderObj') : [];

  if (_.isEmpty(groundOrderObj)) {
    return res.badRequest(400001);
  }

  WebService.updateGroundDisplayOrder(groundOrderObj, function(err, result) {
    if (err) {
      return res.returnError(err);
    }
    return res.data(result);
  });
};


exports.createGroundCharge = function(req, res) {
  var chargeObj = {
    ground: req.param('groundId'),
    week: req.param('week') || '1234560',
    date: req.param('date') || '',
    beginTime: req.param('beginTime') || 0,
    endTime: req.param('endTime') || 0,
    normalPrice: req.param('normalPrice') || 0,
    promotionPrice: req.param('promotionPrice'),
    description: req.param('description') || ''
  };

  if (!chargeObj.promotionPrice) {
    return res.badRequest(400001);
  }

  WebService.createGroundCharge(chargeObj, function(err, result) {
    if (err) {
      return res.returnError(err);
    }
    return res.data(result);
  });
};
