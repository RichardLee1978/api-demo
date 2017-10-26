/**
 * ApiV1Controller
 *
 * @description :: API v1 版
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
'use strict';
module.exports = {
  /**
   * handle已移除接口
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  interfaceIsRemove: function(req, res) {
    return res.data({
      'error_description': 'this interface is remove'
    });
  },

  /**
   * 体育馆列表
   * @URL   get /v1/venues/
   */
  venueList: function(req, res) {
    var category = req.param('category') || '',
      city = req.param('city') || 1,
      district = req.param('district') || '',
      lat = req.param('lat') || 0,
      lng = req.param('lng') || 0,
      skip = req.param('skip') || 0,
      search = req.param('search') || '',
      sort = req.param('sort') || 'distance',
      simple = !_.isEmpty(req.param('simple'));

    VenueV1.venueList(city, district, category, lat, lng, skip, search, sort, simple,
      function(err, results) {
        if (err) {
          return res.returnError(err);
        }
        res.data(results);
      });
  },

  /**
   * 体育馆详情
   * @URL   get /v1/venues/:id/:lat/:lng
   */
  venueDetail: function(req, res) {
    var id = req.param('venueId'),
      lat = req.param('lat') || 0,
      lng = req.param('lng') || 0;

    VenueV1.venueDetail(id, lat, lng,
      function(err, results) {
        if (err) {
          return res.returnError(err);
        }
        res.data(results);
      });
  },

  /**
   * 获取项目的场地情况
   * @URL   get /v1/eventPlan/:id/:day/:time/:duration
   */
  eventPlan: function(req, res) {
    var id = req.param('id') || '',
      day = req.param('day') || '',
      time = req.param('time') || '',
      duration = req.param('duration') || '';

    if (!id || !day || !duration) {
      return res.badRequest(400001);
    }

    GroundV1.eventPlan(id, day, time, duration,
      function(err, results) {
        if (err) {
          return res.returnError(err);
        }
        res.data(results);
      });
  },

  /**
   * 下单
   * @URl    post /v1/sportsOrder
   */
  createSportsOrder: function(req, res) {
    var user = req.user,
      name = req.param('name') || '',
      phone = req.param('phone') || '',
      venue = req.param('venue') || '',
      event = req.param('event') || '',
      ground = req.param('ground') || '',
      groundAmount = req.param('groundAmount') || 0,
      ticket = req.param('ticket') || '',
      startTime = req.param('startTime') || '',
      people = req.param('people') || 1,
      amount = req.param('amount') || 0,
      duration = req.param('duration') || 0,
      quantity = req.param('quantity') || 1,
      payment = req.param('payment') || '',
      comment = req.param('comment') || '',
      promotionCode = req.param('promotionCode') || '',
      charges = req.param('charges') || [],
      rememberContact = req.param('remember') || false;
    // [{id:chargeid,count:number},...]

    if (!name ||
      !phone ||
      !venue ||
      !event ||
      (!ground && !ticket) ||
      !startTime ||
      !payment) {
      return res.badRequest(400001);
    }

    var order = {};
    order.user = user.id;
    order.name = name;
    order.phone = phone;
    order.venue = venue;
    order.event = event;
    order.startTime = startTime;
    order.people = people;
    order.amount = amount;
    order.quantity = quantity;
    order.payment = payment;
    order.comment = comment;
    if (ground) {
      order.ground = ground;
      order.groundAmount = groundAmount;
    }
    if (ticket) {
      order.ticket = ticket;
    }
    order.charges = charges;
    order.promotionCode = promotionCode;
    order.type = ground ? 'ground' : 'ticket';

    SportsOrderV1.createSportsOrder(order, duration, ground, ticket, rememberContact,
      function(err, results) {
        if (err) {
          return res.returnError(err);
        }
        res.data(results);
      });
  },

  /**
   * 取消订单
   * @URL   delete /v1/cancelSportsOrder/:id
   */
  cancelSportsOrder: function(req, res) {
    var id = req.param('id'),
      user = req.user;

    SportsOrderV1.cancelSportsOrder(user, id, function(err) {
      if (err) {
        return res.returnError(err);
      }

      res.data({
        message: 'success'
      });
    });
  },

  /**
   * 订单状态快速查询，如果可用则返回付款剩余时间
   * @URL   get /v1/orderTime/:id
   */
  orderTime: function(req, res) {
    var id = req.param('id');
    if (!id) {
      return res.badRequest(400001);
    }

    InfoV1.orderTime(id, function(err, results) {
      if (err) {
        return res.returnError(err);
      }
      return res.data({
        time: results
      });
    });
  },

  /**
   * 检测用户名是否存在
   * @URL   post /v1/user/exists
   */
  checkUserNameExists: function(req, res) {
    var username = req.param('username');

    if (!username) {
      return res.badRequest(400001);
    }

    UserV1.checkUserNameExists(username, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data({
        exists: result
      });
    });
  },

  /**
   * 获取验证码接口
   * @URl   post /v1/verification/:type
   */
  verificationCode: function(req, res) {
    var phone = req.param('phone'),
      type = req.param('type'),
      ip = req.param('ip') || req.ip,
      client = req.client;

    if (!phone) {
      return res.badRequest(400001);
    }
    if (!_.contains(['register', 'forget', 'coachLogin', 'wechat'], type)) {
      return res.badRequest(400001);
    }

    UserV1.verificationCode(type, phone, client, ip, function(err, results) {
      if (err) {
        return res.returnError(err);
      }
      return res.data({
        code: results
      });
    });
  },

  /**
   * 注册接口
   * @URL    post /v1/user
   */
  userRegister: function(req, res) {
    var username = req.param('username'),
      password = req.param('password'),
      nickname = req.param('nickname'),
      ip = req.ip;

    if (!username || !password || !nickname) {
      return res.badRequest(400001);
    }

    UserV1.userRegister(username, password, nickname, ip, function(err, results) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(results);
    });
  },

  /**
   * 修改密码
   * @URL    put /v1/user/password
   */
  changePassword: function(req, res) {
    var username = req.param('username') || '',
      password = req.param('password') || '';

    if (!username || !password) {
      return res.badRequest(400001);
    }

    UserV1.changePassword(username, password, function(err, result) {
      if (err) {
        return res.returnError(err);
      }

      return res.data({
        result: result
      });
    });
  },

  /**
   * 获取用户信息
   * @URL     get r|^/v1/user(/?)(\\w*)$|,id
   */
  userInfo: function(req, res, next) {
    var id = req.param('id'),
      user = req.user,
      self = false;

    if (!id) {
      id = user.id;
      self = true;
    }
    if (id === user.id) {
      self = true;
    }
    if (id.length !== 24) {
      return next();
    }

    UserV1.userInfo(id, self, user.id, function(err, info) {
      if (err) {
        return res.returnError(err);
      }

      return res.data(info);
    });
  },

  /**
   * 更新用户信息
   * @URL put /v1/user/info
   */
  updateUserInfo: function(req, res) {
    var user = req.user,
      userInfo = {},
      userExtra = {},
      inviter = null;

    if (!_.isUndefined(req.param('nickname'))) {
      userInfo.nickname = req.param('nickname');
    }
    if (!_.isUndefined(req.param('realname'))) {
      userInfo.realname = req.param('realname');
    }
    if (!_.isUndefined(req.param('gender'))) {
      userInfo.gender = req.param('gender');
    }
    if (!_.isUndefined(req.param('avatar'))) {
      userInfo.avatar = req.param('avatar');
    }
    if (!_.isUndefined(req.param('backgroundImage'))) {
      userInfo.backgroundImage = req.param('backgroundImage');
    }
    if (!_.isUndefined(req.param('birthday'))) {
      userInfo.birthday = req.param('birthday');
    }
    if (!_.isUndefined(req.param('city'))) {
      userInfo.city = req.param('city');
    }
    if (!_.isUndefined(req.param('district'))) {
      userInfo.district = req.param('district');
    }
    if (!_.isUndefined(req.param('favoriteSports'))) {
      userInfo.favoriteSports = req.param('favoriteSports');
    }
    if (!_.isUndefined(req.param('bodyData'))) {
      userInfo.bodyData = req.param('bodyData');
    }

    if (!_.isUndefined(req.param('status'))) {
      userExtra.status = req.param('status');
    }
    if (!_.isUndefined(req.param('lat'))) {
      userExtra.latitude = req.param('lat');
    }
    if (!_.isUndefined(req.param('lng'))) {
      userExtra.longitude = req.param('lng');
    }
    if (!_.isUndefined(req.param('atNearby'))) {
      userExtra.atNearby = req.param('atNearby');
    }
    if (!_.isUndefined(req.param('lastContact'))) {
      userExtra.lastContact = req.param('lastContact');
    }
    if (!_.isUndefined(req.param('inviter'))) {
      inviter = req.param('inviter');
    }

    if (_.isEmpty(userInfo) && _.isEmpty(userExtra)) {
      return res.badRequest(400001);
    }

    UserV1.updateUserInfo(user.id, userInfo, userExtra, inviter, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },

  /**
   * 场馆订单列表
   * @URL   get /v1/sportsOrders
   */
  sportsOrderList: function(req, res) {
    var user = req.user,
      skip = req.param('skip') || 0,
      sort = req.param('sort') || 'createdAt',
      type = req.param('type') || '';

    sort += ' DESC';

    SportsOrderV1.sportsOrderList(user.id, skip, sort, type, function(err, results) {
      if (err) {
        return res.returnError(err);
      }

      return res.data(results);
    });
  },

  /**
   * 场馆订单详情
   * @URL   get /v1/sportsOrders/:id
   */
  sportsOrderDetail: function(req, res) {
    var moment = require('moment');
    var id = req.param('id') || '',
      userId = req.user.id,
      lastupdate = req.param('lastupdate') || 0;

    if (!id) {
      return res.badRequest(400001);
    }

    var lastdate = lastupdate ? moment.unix(lastupdate).toDate() : null;

    SportsOrderV1.sportsOrderDetail(id, userId, lastdate, function(err, detail) {
      if (err) {
        return res.returnError(err);
      }
      if (!detail) {
        return res.data({
          message: 'noupdate'
        });
      }
      return res.data({
        detail: detail
      });
    });
  },

  /**
   * 信息打包
   * @URL   get /v1/info
   */
  info: function(req, res) {
    var client = req.client;

    InfoV1.info(client, function(err, info) {
      if (err) {
        return res.returnError(err);
      }

      res.data(info);
    });
  },

  /**
   * 系统信息
   * @URL   get /v1/info/system
   */
  systemInfo: function(req, res) {
    var client = req.client;

    InfoV1.systemInfo(client, function(err, info) {
      if (err) {
        return res.returnError(err);
      }

      res.data(info);
    });
  },

  /**
   * 分类信息
   * @URL   get /v1/info/categories
   */
  categories: function(req, res) {
    var all = req.param('all') || false;
    InfoV1.categories(all, function(err, categories) {
      if (err) {
        res.returnError(err);
      }

      return res.data({
        categories: categories
      });
    });
  },

  /**
   * 城市信息
   * @URL   get /v1/info/cities
   */
  cities: function(req, res) {
    InfoV1.cities(function(err, cities) {
      if (err) {
        res.returnError(err);
      }

      return res.data({
        cities: cities
      });
    });
  },

  /**
   * 行政区信息
   * @URL   get /v1/info/districts
   */
  districts: function(req, res) {
    var city = req.param('city') || 0,
      skip = req.param('skip') || 0;

    InfoV1.districts(city, skip, function(err, districts) {
      if (err) {
        res.returnError(err);
      }

      return res.data(districts);
    });
  },

  /**
   * 时间信息
   * @URL     get /v1/info/time
   */
  time: function(req, res) {
    var info = req.param('info') || false;
    InfoV1.time(info, function(err, timeObj) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(timeObj);
    });
  },

  /**
   * 训练项目信息
   * @URL     get /v1/info/cases
   */
  cases: function(req, res) {
    var skip = req.param('skip') || 0;

    InfoV1.cases(skip, function(err, cases) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(cases);
    });
  },

  /**
   * 训练目标信息
   * @URL     get /v1/info/targets
   */
  targets: function(req, res) {
    InfoV1.targets(function(err, targets) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(targets);
    });
  },

  /**
   * 获取用户端订单状态定义信息
   * @URL     get /v1/info/userStatus
   */
  userStatus: function(req, res) {
    InfoV1.userStatus(function(err, userStatus) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(userStatus);
    });
  },

  /**
   * 获取教练端订单状态定义信息
   * @URL     get /v1/info/coachStatus
   */
  coachStatus: function(req, res) {
    InfoV1.coachStatus(function(err, coachStatus) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(coachStatus);
    });
  },

  /**
   * 获取错误信息列表
   * @URL     get /v1/info/errorDescription
   */
  errorDescription: function(req, res) {
    InfoV1.errorDescription(function(err, errorDescription) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(errorDescription);
    });
  },

  /**
   * 附近的人
   * @URL   get /v1/nearPeople/?lat&lng&skip&gender&sort
   */
  nearbyPeople: function(req, res) {
    var user = req.user,
      lat = req.param('lat'),
      lng = req.param('lng'),
      skip = req.param('skip') || 0,
      gender = req.param('gender') || 'all',
      sports = req.param('sports') || '',
      sort = req.param('sort') || 'distance';

    if (!lat && !lng) {
      return res.badRequest(400001);
    }

    UserV1.nearbyPeople(
      user, lat, lng, skip, gender, sports, sort,
      function(err, result) {
        if (err) {
          return res.returnError(err);
        }

        return res.data(result);
      }
    );
  },

  /**
   * 附近的人未登录用户
   * @URL   get /v1/noLoginNearPeople/?lat&lng&skip&gender&sort
   */
  noLoginNearbyPeople: function(req, res) {
    var lat = req.param('lat'),
      lng = req.param('lng'),
      skip = req.param('skip') || 0,
      gender = req.param('gender') || 'all',
      sports = req.param('sports') || '',
      sort = req.param('sort') || 'distance';

    if (!lat && !lng) {
      return res.badRequest(400001);
    }

    UserV1.nearbyPeople(
      null, lat, lng, skip, gender, sports, sort,
      function(err, result) {
        if (err) {
          return res.returnError(err);
        }

        return res.data(result);
      }
    );
  },

  /**
   * 群组列表
   * @URL   get /v1/groups/?category&skip&search
   */
  groups: function(req, res) {
    var category = req.param('category') || 'all',
      search = req.param('search') || '',
      skip = req.param('skip') || 0;

    GroupV1.groups(category, search, skip, function(err, result) {
      if (err) {
        return res.returnError(err);
      }

      res.data(result);
    });
  },

  /**
   * 群组动态广场
   * @URL   get /v1/square
   */
  square: function(req, res) {
    var type = req.param('type') || 'recommend',
      category = req.param('category') || 'all',
      search = req.param('search') || '',
      skip = req.param('skip') || 0,
      lastupdate = req.param('lastupdate'),
      moment = require('moment'),
      user = req.user;

    var lastdate = lastupdate ? moment.unix(lastupdate).toDate() : null;

    if (!_.contains(['recommend', 'friends', 'groups'], type)) {
      return res.badRequest(400001);
    }

    type = `square${type.substring(0, 1).toLocaleUpperCase()}${type.substring(1)}`;

    PostV1[type](user.id, category, search, skip, lastdate, function(err, result) {
      if (err) {
        return res.returnError(err);
      }

      res.data(result);
    });
  },

  /**
   * 未登录用户广场
   * @URL get /v1/public
   */
  public: function(req, res) {
    var category = req.param('category') || 'all',
      search = req.param('search') || '',
      skip = req.param('skip') || 0,
      lastupdate = req.param('lastupdate'),
      moment = require('moment');

    var lastdate = lastupdate ? moment.unix(lastupdate).toDate() : null;

    PostV1.listPublicWithNoLogin(category, search, skip, lastdate, function(err, result) {
      if (err) {
        return res.returnError(err);
      }

      res.data(result);
    });
  },

  /**
   * 群组详情
   * @URL   get /v1/groups/:groupId
   */
  groupDetail: function(req, res) {
    var groupId = req.param('groupId'),
      user = req.user;

    if (!groupId) {
      return res.badRequest(400001);
    }

    GroupV1.groupDetail(groupId, user.id, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },

  /**
   * 群组成员列表
   * @URL get /v1/groups/:groupId/members?skip
   */
  groupMembers: function(req, res) {
    var groupId = req.param('groupId'),
      skip = req.param('skip') || 0,
      user = req.user;

    GroupV1.groupMembers(user.id, groupId, skip, function(err, results) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(results);
    });
  },

  /**
   * 用户群组列表
   * @URL   get /v1/user(/:id)/groups?skip&simple
   */
  userGroups: function(req, res) {
    var id = req.param('id'),
      user = req.user,
      skip = req.param('skip') || 0,
      type = req.param('type') || 'all',
      simple = !_.isEmpty(req.param('simple'));

    if (!id) {
      id = user.id;
    }

    GroupV1.userGroups(id, type, skip, simple, function(err, results) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(results);
    });
  },

  /**
   * 关注群组
   * @URL   post /v1/groups/:groupId
   */
  followGroup: function(req, res) {
    var user = req.user,
      groupId = req.param('groupId');

    GroupV1.followGroup(user.id, groupId, function(err, result) {
      if (err) {
        return res.returnError(err);
      }

      return res.data(result);
    });
  },

  /**
   * 取消关注群组
   * @URL   delete /v1/groups/:groupId
   */
  unfollowGroup: function(req, res) {
    var user = req.user,
      groupId = req.param('groupId');

    GroupV1.unfollowGroup(user.id, groupId, function(err, result) {
      if (err) {
        return res.returnError(err);
      }

      return res.data(result);
    });
  },

  /**
   * 动态列表
   * @URL   get /v1/groups/:groupId/posts/:skip
   */
  posts: function(req, res) {
    var groupId = req.param('groupId'),
      skip = req.param('skip') || 0,
      lastupdate = req.param('lastupdate'),
      moment = require('moment');

    var lastdate = lastupdate ? moment.unix(lastupdate).toDate() : null;

    PostV1.posts(groupId, skip, lastdate, function(err, result) {
      if (err) {
        return res.returnError(err);
      }

      return res.data(result);
    });
  },

  /**
   * 获取动态详情
   * @URL   get /v1/posts/:postId
   */
  postDetail: function(req, res) {
    var postId = req.param('postId');

    PostV1.postDetail(postId, function(err, post) {
      if (err) {
        return res.returnError(err);
      }
      return res.data({
        post: post
      });
    });
  },

  /**
   * 发表动态
   * @URL   post /v1/groups/:groupId/posts
   * @URL   post /v1/posts
   */
  createPost: function(req, res) {
    var user = req.user,
      groupId = req.param('groupId'),
      category = req.param('category'),
      venue = req.param('venue'),
      title = req.param('title') || '',
      content = req.param('content'),
      picture = req.param('picture'),
      video = req.param('video'),
      tags = req.param('tags') || '';

    if (!title ||
      (!picture && !video)
    ) {
      return res.badRequest(400001);
    }

    var post = {
      author: user.id,
      category: category,
      venue: venue,
      group: groupId,
      title: title,
      content: content,
      picture: picture,
      video: video,
      tags: tags
    };

    PostV1.createPost(post, function(err, obj) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(obj);
    });
  },

  /**
   * 获取动态评论
   * @URL   get /v1/posts/:postId/comment?skip&lastupdate
   */
  listCommentByPost: function(req, res) {
    var postId = req.param('postId'),
      skip = req.param('skip') || 0,
      lastupdate = req.param('lastupdate'),
      moment = require('moment');

    var lastdate = lastupdate ? moment.unix(lastupdate).toDate() : null;

    PostV1.listCommentByPost(postId, skip, lastdate, function(err, obj) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(obj);
    });
  },

  /**
   * 发表评论
   * @URL   post /v1/posts/:postId/comment
   */
  createComment: function(req, res) {
    var user = req.user,
      postId = req.param('postId'),
      to = req.param('to') || 0,
      content = req.param('content');

    if (!content) {
      return res.badRequest(400001);
    }

    PostV1.createComment(user.id, postId, to, content, function(err, obj) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(obj);
    });
  },

  /**
   * 获取动态的点赞列表
   * @URL get /v1/posts/:postId/like?skip
   */
  postLikes: function(req, res) {
    var postId = req.param('postId'),
      skip = req.param('skip') || 0;

    PostV1.postLikes(postId, skip, function(err, results) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(results);
    });
  },

  /**
   * 对动态点赞
   * @URL   post /v1/posts/:postId/like
   */
  likePost: function(req, res) {
    var user = req.user,
      postId = req.param('postId');

    PostV1.likePost(user.id, postId, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },

  /**
   * 对动态取消点赞
   * @URL   delete /v1/posts/:postId/like
   */
  unlikePost: function(req, res) {
    var user = req.user,
      postId = req.param('postId');

    PostV1.unlikePost(user.id, postId, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },

  /**
   * 关注用户
   * @URL   post /v1/friends/:followId
   */
  followUser: function(req, res) {
    var user = req.user,
      followId = req.param('followId'),
      source = req.param('source');

    if (followId === user.id) {
      return res.badRequest(400043);
    }

    if (!followId || !source) {
      return res.badRequest(400001);
    }

    UserV1.followUser(user.id, followId, source, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },

  /**
   * 取消关注用户
   * @URL   delete /v1/friends/:followId
   */
  unfollowUser: function(req, res) {
    var user = req.user,
      unfollowId = req.param('unfollowId');

    UserV1.unfollowUser(user.id, unfollowId, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },

  /**
   * 拉黑用户
   * @URL   post /v1/user/:blockId/block
   */
  blockUser: function(req, res) {
    var user = req.user,
      blockId = req.param('blockId');

    UserV1.blockUser(user.id, blockId, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },

  /**
   * 取消拉黑用户
   * @URL   delete /v1/user/:blockId/block
   */
  unblockUser: function(req, res) {
    var user = req.user,
      blockId = req.param('blockId');

    UserV1.unblockUser(user.id, blockId, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },

  /**
   * 获取好友/粉丝关系
   * @URL get /v1/user/{id}/relation/{friends|fans}?detail&skip
   */
  relation: function(req, res, next) {
    var id = req.param('id'),
      type = req.param('type'),
      detail = req.param('detail') || false,
      simple = req.param('simple') || false,
      skip = req.param('skip') || 0,
      user = req.user;

    if (!id) {
      id = user.id;
    }

    if (!id || !type || !_.contains(['friends', 'fans', 'blocks'], type)) {
      return res.badRequest(400001);
    }
    if (id.length !== 24) {
      return next();
    }

    if (detail) {
      simple = false;
    }

    UserV1.relation(id, type, detail, simple, skip, function(err, results) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(results);
    });
  },

  /**
   * 获取时间线
   * @URL get /v1/user/{id?}/timeline?lastupdate&skip
   */
  timeline: function(req, res) {
    var id = req.param('id'),
      user = req.user,
      skip = req.param('skip') || 0,
      lastupdate = req.param('lastupdate') || 0,
      moment = require('moment');

    var lastdate = lastupdate ? moment.unix(lastupdate).toDate() : null;

    UserV1.timeline(id, user.id, lastdate, skip, function(err, results) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(results);
    });
  },

  /**
   * 标签列表
   * @URL get /v1/tag?type&skip&lastupdate;
   */
  taglist: function(req, res) {
    var type = req.param('type') || 'post',
      skip = req.param('skip') || 0,
      lastupdate = req.param('lastupdate') || 0,
      recommend = req.param('recommend') || false,
      moment = require('moment');

    var lastdate = lastupdate ? moment.unix(lastupdate).toDate() : null;

    TagV1.list(type, recommend, lastdate, skip, function(err, results) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(results);
    });
  },

  /**
   * 创建新tag
   * @URL post /v1/tag
   */
  newTag: function(req, res) {
    var type = req.param('type'),
      title = req.param('title'),
      user = req.user;

    TagV1.createTag(user.id, type, title, function(err, tag) {
      if (err) {
        return res.returnError(err);
      }
      return res.data({
        tag: tag
      });
    });
  },

  /**
   * 获取用户赞过的历史纪录
   * @URL get /v1/user/likes/:type?skip
   */
  userLikes: function(req, res) {
    var type = req.param('type'),
      user = req.user,
      skip = req.param('skip') || 0;

    if (!_.contains(['posts'], type)) {
      return res.badRequest(400001);
    }

    UserV1.likes(user.id, type, skip, function(err, results) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(results);
    });
  },

  /**
   * 注册设备推送token
   * @URL post /v1/user/device/:app?token
   */
  registerDevice: function(req, res) {
    var client = req.client,
      user = req.user,
      app = req.param('app'),
      token = req.param('token'),
      type = client.type;

    UserV1.registerDevice(type, user, app, token, function(err, results) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(results);
    });
  },

  /**
   * 移除设备推送token
   * @URL delete /v1/user/device/:app?token
   */
  removeDevice: function(req, res) {
    var client = req.client,
      user = req.user,
      app = req.param('app'),
      token = req.param('token'),
      type = client.type;

    UserV1.removeDevice(type, user, app, token, function(err, results) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(results);
    });
  },

  /**
   * 保存用户创建的聊天频道
   * @URL post /v1/channel/:channelId
   */
  userCreatedChannel: function(req, res) {
    var channelId = req.param('channelId'),
      user = req.user,
      name = req.param('name') || '',
      description = req.param('description') || '',
      isPublic = true,
      approval = false,
      invite = true,
      maxUsers = req.param('maxUsers') || 500,
      members = req.param('members') || [];

    var createdBy = user.id;

    if (!name) {
      return res.badRequest(400001);
    }

    GroupV1.userCreatedChannel(
      channelId,
      createdBy,
      name,
      description,
      isPublic,
      maxUsers,
      approval,
      invite,
      members,
      function(err, result) {
        if (err) {
          return res.returnError(err);
        }
        return res.data(result);
      });
  },

  /**
   * 更新用户聊天频道信息
   * @URL put /v1/channel/:channelId
   */
  updateUserChannel: function(req, res) {
    var channelId = req.param('channelId'),
      user = req.user,
      name = req.param('name'),
      description = req.param('description'),
      maxUsers = req.param('maxUsers');

    var channelInfo = {};
    if (name) {
      channelInfo.name = name;
    }
    if (description) {
      channelInfo.description = description;
    }
    if (maxUsers) {
      channelInfo.maxUsers = maxUsers;
    }

    GroupV1.updateUserChannel(user, channelId, channelInfo, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },
  /**
   * 解散用户聊天频道
   * @URL delete /v1/channel/:channelId
   */
  dismissUserChannel: function(req, res) {
    var channelId = req.param('channelId'),
      user = req.user;

    GroupV1.dismissUserChannel(user, channelId, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },

  /**
   * 管理员加人进入频道
   * @URL post r|^/v1/channel/:channelId/members(/?)(\\w*)$|,memberId
   */
  addMemberToUserChannel: function(req, res) {
    var user = req.user,
      channelId = req.param('channelId'),
      memberId = req.param('memberId') || req.param('members');

    GroupV1.addMemberToUserChannel(user.id, channelId, memberId, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },

  /**
   * 管理员移除频道成员
   * @URL delete /v1/channel/:channelId/members/:memberId
   */
  removeMemberFromUserChannel: function(req, res) {
    var user = req.user,
      channelId = req.param('channelId'),
      memberId = req.param('memberId');

    GroupV1.removeMemberFromUserChannel(user.id, channelId, memberId, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },

  /**
   * 成员加入频道，自建频道默认允许用户邀请其他用户
   * @URL post /v1/channel/:channelId/invite
   */
  inviteMemberToUserChannel: function(req, res) {
    var user = req.user,
      channelId = req.param('channelId'),
      memberId = req.param('memberId');

    GroupV1.inviteMemberToUserChannel(user.id, channelId, memberId, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },

  /**
   * 成员退出频道
   * @URL delete /v1/channel/:channelId/members
   */
  memberLeaveChannel: function(req, res) {
    var user = req.user,
      channelId = req.param('channelId');

    GroupV1.memberLeaveChannel(user.id, channelId, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },

  /**
   * 关联第三方账号
   * @URL post /v1/user/account/:type
   */
  linkThirdParty: function(req, res) {
    var type = req.param('type'),
      user = req.user;

    if (!_.contains(Constant.thirdPartyAccountType, type)) {
      return res.badRequest(400001);
    }

    var info = {};
    info.accessToken = req.param('accessToken');
    info.expiresIn = req.param('expiresIn');

    if (type === 'wechat') {
      info.refreshToken = req.param('refreshToken');
      info.openId = req.param('openId');
      info.unionId = req.param('unionId');
      info.scope = req.param('scope');

      if (!info.accessToken || !info.expiresIn || !info.refreshToken ||
        !info.openId || !info.scope || !info.unionId) {
        return res.badRequest(400001);
      }
    } else if (type === 'weibo') {
      info.uid = req.param('uid');

      if (!info.accessToken || !info.expiresIn || !info.uid) {
        return res.badRequest(400001);
      }
    }

    UserV1.linkThirdParty(type, user.id, info, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },

  /**
   * 修改第三方账号信息
   * @URL put /v1/user/account/:type
   */
  updateThirdParty: function(req, res) {
    var type = req.param('type'),
      user = req.user;

    if (!_.contains(Constant.thirdPartyAccountType, type)) {
      return res.badRequest(400001);
    }

    var info = {};
    info.accessToken = req.param('accessToken');
    info.expiresIn = req.param('expiresIn');

    if (type === 'wechat') {
      info.refreshToken = req.param('refreshToken');
      info.openId = req.param('openId');
      info.unionId = req.param('unionId');
      info.scope = req.param('scope');

      if (!info.accessToken || !info.expiresIn || !info.refreshToken ||
        !info.openId || !info.scope || !info.unionId) {
        return res.badRequest(400001);
      }
    } else if (type === 'weibo') {
      info.uid = req.param('uid');

      if (!info.accessToken || !info.expiresIn || !info.uid) {
        return res.badRequest(400001);
      }
    }

    UserV1.updateThirdParty(type, user.id, info, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },

  /**
   * 解除第三方账号关联
   * @URL delete /v1/user/account/:type
   */
  removeThirdParty: function(req, res) {
    var type = req.param('type'),
      user = req.user;

    if (!_.contains(Constant.thirdPartyAccountType, type)) {
      return res.badRequest(400001);
    }

    UserV1.removeThirdParty(type, user.id, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },

  /**
   * 添加收藏
   * @URL   post /v1/favorite/:type/:id
   */
  favorite: function(req, res) {
    var user = req.user,
      type = req.param('type'),
      objectId = req.param('id');

    if (!_.contains(Constant.favoriteType, type)) {
      return res.badRequest(400001);
    }

    UserV1.favorite(user.id, type, objectId, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },

  /**
   * 移除收藏
   * @URL   delete /v1/favorite/:type/:id
   */
  unFavorite: function(req, res) {
    var user = req.user,
      type = req.param('type'),
      objectId = req.param('id');

    if (!_.contains(Constant.favoriteType, type)) {
      return res.badRequest(400001);
    }

    UserV1.unFavorite(user.id, type, objectId, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },

  /**
   * 附近的教练
   * @URL   get /v1/nearCoach/?lat&lng&gender&category&city&district&sort&skip
   */
  nearByCoach: function(req, res) {
    var user = req.user,
      lat = req.param('lat'),
      lng = req.param('lng'),
      gender = req.param('gender') || 'all',
      category = req.param('category') || '',
      city = req.param('city') || 1,
      district = req.param('district'),
      sort = req.param('sort') || 'distance',
      skip = req.param('skip') || 0;

    if (!lat && !lng) {
      return res.badRequest(400001);
    }

    UserV1.nearByCoach(
      user.id, lat, lng, gender, category, city, district, sort, skip,
      function(err, result) {
        if (err) {
          return res.returnError(err);
        }

        return res.data(result);
      }
    );
  },

  /**
   * 创建教练订单
   * @URL   post /v1/coachOrders
   */
  createCoachOrder: function(req, res) {
    var user = req.user,
      coach = req.param('coach'),
      venue = req.param('venue'),
      location = req.param('location'),
      trainCase = req.param('trainCase'),
      payment = req.param('payment'),
      amount = req.param('amount'),
      startTime = req.param('startTime') || '',
      endTime = req.param('endTime') || '',
      details = req.param('details') || [],
      moment = require('moment');

    if (!coach || (!location && !venue) || !trainCase || !amount ||
      !startTime || !endTime) {
      return res.badRequest(400001);
    }

    var order = {
      user: user.id,
      coach: coach,
      trainCase: trainCase,
      payment: payment,
      venue: venue,
      location: location,
      amount: amount
    };
    var startDate = moment(startTime, 'YYYYMMDDHHmm');
    var endDate = moment(endTime, 'YYYYMMDDHHmm');
    order.startTime = startDate.toDate();
    order.endTime = endDate.toDate();

    if (_.isEmpty(details)) {
      details.push({
        date: _.parseInt(startDate.format('YYYYMMDD')),
        from: _.parseInt(startDate.format('HHmm')),
        to: _.parseInt(endDate.format('HHmm'))
      });
    }

    CoachOrderV1.createCoachOrder(user.id, order, details, function(err, results) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(results);
    });
  },

  /**
   * 订单列表
   * @URL   get /v1/coachOrders
   */
  coachOrderList: function(req, res) {
    var user = req.user,
      skip = req.param('skip') || 0,
      sort = req.param('sort') || 'createdAt',
      type = req.param('type') || '';

    sort += ' DESC';

    CoachOrderV1.coachOrderList(user.id, skip, sort, type, function(err, results) {
      if (err) {
        return res.returnError(err);
      }

      return res.data(results);
    });
  },

  /**
   * 教练订单详情
   * @URL   get /v1/coachOrders/:id
   */
  coachOrderDetail: function(req, res) {
    var moment = require('moment');
    var id = req.param('id') || '',
      userId = req.user.id,
      lastupdate = req.param('lastupdate') || 0;

    if (!id) {
      return res.badRequest(400001);
    }

    var lastdate = lastupdate ? moment.unix(lastupdate).toDate() : null;

    CoachOrderV1.coachOrderDetail(id, userId, lastdate, function(err, detail) {
      if (err) {
        return res.returnError(err);
      }
      if (!detail) {
        return res.data({
          message: 'noupdate'
        });
      }
      return res.data({
        detail: detail
      });
    });
  },

  /**
   * 处理订单
   * @URL   put /v1/sportsOrders/:id  put /v1/coachOrders/:id
   */
  processOrder: function(req, res) {
    var user = req.user,
      orderId = req.param('id'),
      step = req.param('step');

    if (!step) {
      return res.badRequest(400001);
    }

    OrderTaskV1.process(user.id, orderId, step, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },

  /**
   * 根据手机号码搜索用户
   * @URL   post /v1/user/search
   */
  searchUserByUsername: function(req, res) {
    var user = req.user,
      username = req.param('phone');

    UserV1.searchUserByUsername(user.id, username, function(err, result) {
      if (err) {
        return res.returnError(err);
      }
      return res.data(result);
    });
  },

  /**
   * 获取订单编号
   * @URL  get /v1/orderNo?type
   */
  orderNo: function(req, res) {
    var type = req.param('type'),
      client = req.client;

    if (!_.contains(['sports', 'coach', 'activity', 'refund'], type.toLowerCase())) {
      return res.badRequest(400001);
    }

    return res.data({
      orderNo: OrderNo.createOrderNo(type, client.type)
    });
  }
};
