/**
 * VenueController
 *
 * @description :: 体育馆相关
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
'use strict';

exports.venueList = function(req, res) {
  var city = req.param('city') || 0,
    district = req.param('district') || '',
    type = req.param('type') || '',
    category = req.param('category') || '',
    search = req.param('search') || '',
    sort = req.param('sort') || 'displayOrder',
    page = req.param('page') || 1;

  WebService.venueList(city, district, type, category, search, sort, page,
    function(err, results) {
    if (err) {
      return res.returnError(err);
    }
    return res.data(results);
  });
};

exports.venueDetail = function(req, res) {
  var venueId = req.param('venueId');

  WebService.venueDetail(venueId, function(err, detail) {
    if (err) {
      return res.returnError(err);
    }
    return res.data(detail);
  });
};

exports.createVenue = function(req, res) {
  var venueObj = {
    name: req.param('name') || '',
    subname: req.param('subname') || '',
    city: req.param('city') || 1,
    district: req.param('district') || 1,
    cbd: req.param('cbd') || '',
    address: req.param('address') || '',
    phone: req.param('phone') || '',
    opentime: req.param('opentime') || '0900',
    closetime: req.param('closetime') || '2200',
    chain: req.param('chain') || false,
    master: req.param('master') || false,
    onlinePaid: req.param('onlinePaid') || false,
    paidMethod: req.param('paidMethod')
      ? req.param('paidMethod') : ['cash', 'alipay'],
    traffic: req.param('traffic') ? req.param('traffic') : [],
    avgPrice: req.param('avgPrice') || 0,
    type: req.param('type') || 'venue',
    latitude: req.param('latitude'),
    longitude: req.param('longitude'),
    score: req.param('score') || 3.5,
    contract: req.param('contract') ? req.param('contract') : [],
    displayOrder: req.param('displayOrder') || 0,
    image: req.param('image') || '',
    recommend: req.param('recommend') || false,
    description: req.param('description') || ''
  };

  if (!venueObj.name || !venueObj.address || !venueObj.phone
    || !venueObj.latitude || !venueObj.longitude) {
    return res.badRequest(400001);
  }

  WebService.createVenue(venueObj, function(err, result) {
    if (err) {
      return res.returnError(err);
    }
    return res.data(result);
  });
};

exports.updateVenue = function(req, res) {
  var venueId = req.param('venueId');
  var venueObj = {};

  if (req.param('name')) {
    venueObj.name = req.param('name');
  }
  if (req.param('subname')) {
    venueObj.subname = req.param('subname');
  }
  if (req.param('city')) {
    venueObj.city = req.param('city');
  }
  if (req.param('district')) {
    venueObj.district = req.param('district');
  }
  if (req.param('cbd')) {
    venueObj.cbd = req.param('cbd');
  }
  if (req.param('address')) {
    venueObj.address = req.param('address');
  }
  if (req.param('phone')) {
    venueObj.phone = req.param('phone');
  }
  if (req.param('opentime')) {
    venueObj.opentime = req.param('opentime');
  }
  if (req.param('closetime')) {
    venueObj.closetime = req.param('closetime');
  }
  if (req.param('chain')) {
    venueObj.chain = req.param('chain');
  }
  if (req.param('master')) {
    venueObj.master = req.param('master');
  }
  if (req.param('onlinePaid')) {
    venueObj.onlinePaid = req.param('onlinePaid');
  }
  if (req.param('paidMethod')) {
    venueObj.paidMethod = req.param('paidMethod');
  }
  if (req.param('traffic')) {
    venueObj.traffic = req.param('traffic');
  }
  if (req.param('avgPrice')) {
    venueObj.avgPrice = req.param('avgPrice');
  }
  if (req.param('type')) {
    venueObj.type = req.param('type');
  }
  if (req.param('enabled')) {
    venueObj.enabled = req.param('enabled');
  }
  if (req.param('score')) {
    venueObj.score = req.param('score');
  }
  if (req.param('contract')) {
    venueObj.contract = req.param('contract');
  }
  if (req.param('displayOrder')) {
    venueObj.displayOrder = req.param('displayOrder');
  }
  if (req.param('image')) {
    venueObj.image = req.param('image');
  }
  if (req.param('recommend')) {
    venueObj.recommend = req.param('recommend');
  }
  if (req.param('description')) {
    venueObj.description = req.param('description');
  }

  WebService.updateVenue(venueId, venueObj, function(err, result) {
    if (err) {
      return res.returnError(err);
    }
    return res.data(result);
  });
};

exports.updateVenueDisplayOrder = function(req, res) {
  var city = req.param('city'),
    orderObj = req.param('orderObj') ? req.param('orderObj') : [];

  if (_.isEmpty(orderObj)) {
    return res.badRequest(400001);
  }

  WebService.updateVenueDisplayOrder(city, orderObj, function(err, result) {
    if (err) {
      return res.returnError(err);
    }
    return res.data(result);
  });
};
