'use strict';

/**
 * CoachController
 *
 * @description :: 教练相关
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

exports.coachList = function(req, res) {
  var city = req.param('city') || 1,
    district = req.param('district') || '',
    category = req.param('category') || '',
    gender = req.param('gender') || 'all',
    search = req.param('search') || '',
    sort = req.param('sort') || 'displayOrder',
    page = req.param('page') || 1;

  WebService.coachList(city, district, category, gender, search, sort, page, function(err, coachs) {
    if (err) {
      return res.returnError(err);
    }
    return res.data(coachs);
  });
};

exports.coachDetail = function(req, res) {
  var id = req.param('coachId');

  WebService.coachDetail(id, function(err, coach) {
    if (err) {
      return res.returnError(err);
    }
    return res.data(coach);
  });
};

exports.createVerifyCoach = function(req, res) {
  var username = req.param('username'),
    password = req.param('password'),
    nickname = req.param('nickname'),
    gender = req.param('gender'),
    birthday = req.param('birthday'),
    city = req.param('city'),
    district = req.param('district'),
    realname = req.param('realname'),
    title = req.param('title'),
    serialNumber = req.param('serialNumber'),
    regions = req.param('regions'),
    hometown = req.param('hometown') || '',
    languages = req.param('languages'),
    academic = req.param('academic'),
    category = req.param('category'),
    bodyData = req.param('bodyData'),
    experience = req.param('experience'),
    certificate = req.param('certificate'),
    cases = req.param('cases'),
    description = req.param('description') || '',
    idCardType = req.param('idCardType'),
    idNumber = req.param('idNumber');

  if (!username || !password || !nickname || !city || !realname
    || !gender || !birthday || !district) {
    return res.badRequest(400001);
  }

  if (!title || !serialNumber || !regions || !languages || !academic
    || !category || !cases || !idCardType || !idNumber) {
    return res.badRequest(400001);
  }

  async.auto({
    user: function userFn(callback) {
      UserV1.userRegister(username, password, nickname, req.ip, callback);
    },
    coachInfo: [
      'user',
      function coachInfoFn(callback) {
        WebService.createVerifyCoach(username, {
          city: city,
          realname: realname,
          gender: gender,
          birthday: birthday,
          district: district
        }, {
          title: title,
          serialNumber: serialNumber,
          regions: regions,
          hometown: hometown,
          languages: languages,
          academic: academic,
          category: category,
          bodyData: bodyData,
          experience: experience,
          certificate: certificate,
          cases: cases,
          description: description,
          idCardType: idCardType,
          idNumber: idNumber
        }, callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return res.returnError(err);
    }
    return res.data({
      id: results.coachInfo.id
    });
  });
};

exports.verifyCoachFromUser = function(req, res) {
  var userId = req.param('userId'),
    title = req.param('title'),
    serialNumber = req.param('serialNumber'),
    regions = req.param('regions'),
    hometown = req.param('hometown') || '',
    languages = req.param('languages'),
    academic = req.param('academic'),
    category = req.param('category'),
    bodyData = req.param('bodyData'),
    experience = req.param('experience'),
    certificate = req.param('certificate'),
    cases = req.param('cases'),
    description = req.param('description') || '',
    idCardType = req.param('idCardType'),
    idNumber = req.param('idNumber');

  if (!title || !serialNumber || !regions || !languages || !academic
    || !category || !cases || !idCardType || !idNumber) {
    return res.badRequest(400001);
  }

  async.auto({
    coachInfo: function coachInfoFn(callback) {
      WebService.verifyCoachFromUser(userId, {
        title: title,
        serialNumber: serialNumber,
        regions: regions,
        hometown: hometown,
        languages: languages,
        academic: academic,
        category: category,
        bodyData: bodyData,
        experience: experience,
        certificate: certificate,
        cases: cases,
        description: description,
        idCardType: idCardType,
        idNumber: idNumber
      }, callback);
    }
  }, function(err) {
    if (err) {
      return res.returnError(err);
    }
    return res.data({
      status: true
    });
  });
};

exports.updateCoachInfo = function(req, res) {
  var coachId = req.param('coachId'),
    title = req.param('title'),
    serialNumber = req.param('serialNumber'),
    regions = req.param('regions'),
    hometown = req.param('hometown'),
    languages = req.param('languages'),
    academic = req.param('academic'),
    category = req.param('category'),
    bodyData = req.param('bodyData'),
    experience = req.param('experience'),
    certificate = req.param('certificate'),
    cases = req.param('cases'),
    description = req.param('description'),
    idCardType = req.param('idCardType'),
    idNumber = req.param('idNumber');

  var coachInfo = {
    title: title,
    serialNumber: serialNumber,
    regions: regions,
    hometown: hometown,
    languages: languages,
    academic: academic,
    category: category,
    bodyData: bodyData,
    experience: experience,
    certificate: certificate,
    cases: cases,
    description: description,
    idCardType: idCardType,
    idNumber: idNumber
  };

  for (var key in coachInfo) {
    if (!coachInfo[key]) {
      delete coachInfo[key];
    }
  }

  WebService.updateCoachInfo(coachId, coachInfo, function(err) {
    if (err) {
      return res.returnError(err);
    }
    return res.data({
      status: true
    });
  });
};

exports.disableCoach = function(req, res) {
  var coachId = req.param('coachId');

  WebService.disableCoach(coachId, function(err) {
    if (err) {
      return res.returnError(err);
    }
    return res.data({
      status: true
    });
  });
};
