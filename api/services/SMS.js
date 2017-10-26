'use strict';

var request = require('request');

exports.send = function(type, phone, content, callback) {
  if (!process.env.SMS_SN || !process.env.SMS_PWD || !Constant.sms.suffix) {
    sails.log.debug(`${phone}[${type}] - ${content}`);
    return callback(null, null);
  }
  var md5str = require('crypto').createHash('md5')
        .update(`${process.env.SMS_SN}${process.env.SMS_PWD}`)
        .digest('hex').toUpperCase();
  var queryData = {
    sn: process.env.SMS_SN,
    pwd: md5str,
    mobile: phone,
    content: encodeURI(`${content}${Constant.sms.suffix}`),
    ext: '',
    stime: '',
    rrid: '',
    msgfmt: ''
  };
  request.post({
    url: 'http://sdk.entinfo.cn:8061/webservice.asmx/mdsmssend',
    form: queryData
  }, function(err, resp, body) {
    if (err) {
      sails.log.error(err);
      return callback(err);
    }

    SmsRecord.create({
      type: type,
      phone: phone,
      content: content,
      response: body
    }).exec(callback);
  });
};

exports.sendBusinessSms = function(type, phone, content, callback) {
  if (!process.env.YUNPIANSMS_APIKEY || !Constant.sms.suffix) {
    sails.log.debug(`${phone}[${type}] - ${content}`);
    return callback(null, null);
  }
  request.post({
    url: 'http://yunpian.com/v1/sms/send.json',
    form: {
      apikey: process.env.YUNPIANSMS_APIKEY,
      mobile: phone,
      text: `${Constant.sms.suffix}${content}`
    }
  }, function(err, resp, body) {
    if (err) {
      sails.log.error(err);
      return callback(err);
    }

    SmsRecord.create({
      type: type,
      phone: phone,
      content: content,
      response: body
    }).exec(callback);
  });
};
