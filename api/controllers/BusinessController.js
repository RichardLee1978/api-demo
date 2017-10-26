/**
 * BusinessController
 *
 * @description :: 商务相关
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict';

exports.createContact = function(req, res) {
  var type = req.param('type'),
		name = req.param('name'),
		phone = req.param('phone'),
		city = req.param('city'),
		district = req.param('district'),
		address = req.param('address');

  if (!_.contains(['venue', 'coach'], type)) {
    return res.badRequest(400001);
  }

  if (!name || !phone || !city || !district || (type === 'venue' && !address)) {
    return res.badRequest(400001);
  }

  WebService.createContact(type, name, phone, city, district, address, function(err, results) {
    if (err) {
      return res.returnError(err);
    }
    return res.data(results);
  });
};

exports.contactList = function(req, res) {
  var type = req.param('type'),
    city = req.param('city'),
    isProcessed = req.param('isProcessed'),
    page = req.param('page') || 1;

  WebService.contactList(type, city, isProcessed, page, function(err, results) {
    if (err) {
      return res.returnError(err);
    }
    return res.data(results);
  });
};
