'use strict';

var moment = require('moment');

exports.createOrderNo = function(type, clientType) {
  var numStr = 'WL';
  switch (type) {
    case 'sports':
      numStr += '01';
      break;
    case 'coach':
      numStr += '02';
      break;
    case 'activity':
      numStr += '03';
      break;
    case 'refund':
      numStr += '04';
      break;
    default:
      numStr += '99';
      break;
  }
  switch (clientType) {
    case 'user-ios':
      numStr += '1';
      break;
    case 'user-android':
      numStr += '2';
      break;
    case 'coach-ios':
      numStr += '3';
      break;
    case 'coach-android':
      numStr += '4';
      break;
    case 'web':
      numStr += '5';
      break;
    default:
      numStr += '9';
      break;
  }
  // parseInt('479727005C94B00',16)/16
  var str = moment().format('YYYYMMDDHHmmssSSS');
  numStr += (+(str) * 16).toString(16).toUpperCase();
  return numStr;
};
