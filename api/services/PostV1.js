'use strict';
/**
 * 社交圈动态列表
 * @param     {string}      groupId     社交圈ID
 * @param     {integer}     skip        跳过记录数
 * @param     {date}        lastdate    最后更新时间
 * @param     {function}    cb          回调函数
 * @return    {total, list} 总数，动态数组
 */
exports.posts = function(groupId, skip, lastdate, cb) {
  var filterObj = {
    where: {
      or: [{
        group: groupId
      }, {
        group: '*'
      }],
      enabled: true
    },
    limit: Constant.listLimit,
    skip: skip,
    sort: {
      'recommend': 'ASC',
      'displayOrder': 'DESC',
      'createdAt': 'ASC'
    }
  };
  if (lastdate) {
    filterObj.where.updatedAt = {
      '>': lastdate
    };
  }
  Post.list(filterObj, cb);
};

/**
 * 获取广场 - 猜你喜欢
 * @param  {string}     userId    用户ID
 * @param  {string}     category  运动分类
 * @param  {string}     search    搜索文本
 * @param  {integer}    skip      跳过记录数字
 * @param  {date}       lastdate  最后更新时间
 * @param  {Function}   cb        回调函数
 * @return {Object}            total, list
 */
exports.squareRecommend = function(userId, category, search, skip, lastdate, cb) {
  var moment = require('moment');
  var filterObj = {
    where: {
      enabled: true
    },
    limit: Constant.listLimit,
    skip: skip,
    sort: {
      'recommend': 0,
      'displayOrder': 1,
      'createdAt': 0
    }
  };
  if (category && category !== 'all') {
    filterObj.where.category = category;
  }
  if (search) {
    filterObj.where.or = [{
      title: {
        'contains': search
      }
    }, {
      content: {
        'contains': search
      }
    }];
  }
  // if (lastdate) {
  //   filterObj.where.updatedAt = {
  //     '>': lastdate
  //   };
  // }

  var cacheId = `square-${userId}`;
  async.auto({
    cacheExists: function cacheExistsFn(callback) {
      Cache.exists(cacheId, callback);
    },
    postIds: [
      'cacheExists',
      function postIdsFn(callback, result) {
        if (result.cacheExists) {
          return Cache.get(cacheId, callback);
        } else {
          return makeCache(userId, function(err, cacheIds) {
            if (err) {
              return callback(err);
            }
            if (_.isEmpty(cacheIds)) {
              return callback(null, []);
            }
            var expire = moment().endOf('day').unix() - moment().unix();
            Cache.set(cacheId, cacheIds, expire, function(err) {
              if (err) {
                return callback(err);
              }
              return callback(null, cacheIds);
            });
          });
        }
      }
    ],
    total: [
      'postIds',
      function totalFn(callback, result) {
        if (_.isEmpty(result.postIds)) {
          return callback(null, 0);
        }
        filterObj.where.id = result.postIds;
        Post.count(filterObj.where).exec(callback);
      }
    ],
    list: [
      'total',
      function listFn(callback, result) {
        if (!result.total) {
          return callback(null, []);
        }
        Post.list(filterObj, callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, {
      total: results.total,
      list: results.list
    });
  });
};

/**
 * 获取广场 - 关注
 * @param  {string}     userId    用户ID
 * @param  {string}     category  运动分类
 * @param  {string}     search    搜索文本
 * @param  {integer}    skip      跳过记录数字
 * @param  {date}       lastdate  最后更新时间
 * @param  {Function}   cb        回调函数
 * @return {Object}            total, list
 */
exports.squareFriends = function(userId, category, search, skip, lastdate, cb) {
  var filterObj = {
    where: {
      enabled: true
    },
    limit: Constant.listLimit,
    skip: skip,
    sort: {
      'recommend': 0,
      'displayOrder': 1,
      'createdAt': 0
    }
  };
  if (category && category !== 'all') {
    filterObj.where.category = category;
  }
  if (search) {
    filterObj.where.or = [{
      title: {
        'contains': search
      }
    }, {
      content: {
        'contains': search
      }
    }];
  }
  if (lastdate) {
    filterObj.where.updatedAt = {
      '>': lastdate
    };
  }
  async.auto({
    friends: function friendsFn(callback) {
      UserRelation.findOne(userId).exec(function(err, result) {
        if (err) {
          return callback(err);
        }
        var friends = _.pluck(result.friends, 'id');
        filterObj.where.author = friends;
        return callback(null, null);
      });
    },
    total: [
      'friends',
      function totalFn(callback) {
        Post.count(filterObj.where).exec(callback);
      }
    ],
    list: [
      'total',
      function listFn(callback, result) {
        if (!result.total) {
          return callback(null, []);
        }
        Post.list(filterObj, callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, {
      total: results.total,
      list: results.list
    });
  });
};

/**
 * 获取广场 - 圈子
 * @param  {string}     userId    用户ID
 * @param  {string}     category  运动分类
 * @param  {string}     search    搜索文本
 * @param  {integer}    skip      跳过记录数字
 * @param  {date}       lastdate  最后更新时间
 * @param  {Function}   cb        回调函数
 * @return {Object}            total, list
 */
exports.squareGroups = function(userId, category, search, skip, lastdate, cb) {
  var filterObj = {
    where: {
      enabled: true
    },
    limit: Constant.listLimit,
    skip: skip,
    sort: {
      'recommend': 0,
      'displayOrder': 1,
      'createdAt': 0
    }
  };
  if (category && category !== 'all') {
    filterObj.where.category = category;
  }
  if (search) {
    filterObj.where.or = [{
      title: {
        'contains': search
      }
    }, {
      content: {
        'contains': search
      }
    }];
  }
  if (lastdate) {
    filterObj.where.updatedAt = {
      '>': lastdate
    };
  }
  async.auto({
    groups: function groupsFn(callback) {
      Group.listUserGroupIds(userId, function(err, ids) {
        if (err) {
          return callback(err);
        }
        var gobj = [{
          group: ids
        }, {
          group: '*'
        }];
        if (search) {
          filterObj.where.or = _.union(filterObj.where.or, gobj);
        } else {
          filterObj.where.or = gobj;
        }
        return callback(null, null);
      });
    },
    total: [
      'groups',
      function totalFn(callback) {
        Post.count(filterObj.where).exec(callback);
      }
    ],
    list: [
      'total',
      function listFn(callback, result) {
        if (!result.total) {
          return callback(null, []);
        }
        Post.list(filterObj, callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, {
      total: results.total,
      list: results.list
    });
  });
};

/**
 * 未登录用户广场
 * @param  {string}     category  运动分类
 * @param  {string}     search    搜索文本
 * @param  {integer}    skip      跳过记录数字
 * @param  {date}       lastdate  最后更新时间
 * @param  {Function}   cb        回调函数
 * @return {Object}            total, list
 */
exports.listPublicWithNoLogin = function(category, search, skip, lastdate, cb) {
  var filterObj = {
    where: {
      enabled: true
    },
    limit: Constant.listLimit,
    skip: skip,
    sort: {
      'recommend': 0,
      'displayOrder': 1,
      'createdAt': 0
    }
  };
  if (category && category !== 'all') {
    filterObj.where.category = category;
  }
  if (search) {
    filterObj.where.or = [{
      title: {
        'contains': search
      }
    }, {
      content: {
        'contains': search
      }
    }];
  }
  if (lastdate) {
    filterObj.where.updatedAt = {
      '>': lastdate
    };
  }
  async.auto({
    listIds: function listIdsFn(callback) {
      Group.listPublicAndUserGroupIds(null, function(err, ids) {
        if (err) {
          return callback(err);
        }
        var gobj = [{
          group: ids
        }, {
          group: '*'
        }];
        if (search) {
          filterObj.where.or = _.union(filterObj.where.or, gobj);
        } else {
          filterObj.where.or = gobj;
        }
        return callback(null, null);
      });
    },
    returnObj: [
      'listIds',
      function returnObjFn(callback) {
        Post.list(filterObj, callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.returnObj);
  });
};

/**
 * 获取动态详情
 * @param  {string}   postId 动态ID
 * @param  {Function} cb     回调函数
 * @return {Post}          动态
 */
// TODO: 考虑是否移动到model内，以及加入批量获取的方法
exports.postDetail = function(postId, cb) {
  async.auto({
    post: function postFn(callback) {
      Post.findOne(postId).populate('venue').exec(function(err, post) {
        if (err) {
          return callback(err);
        }
        if (!post) {
          return callback(Utils.error(400032));
        }
        if (!post.enabled) {
          return callback(Utils.error(400033));
        }
        return callback(null, post);
      });
    },
    likes: [
      'post',
      function likesFn(callback) {
        PostLike.byPost(postId, 0, function(err, likes) {
          if (err) {
            return callback(err);
          }
          return callback(null, likes);
        });
      }
    ],
    author: [
      'post',
      function authorFn(callback, result) {
        User.withId(false, result.post.author, null, ['info', 'extra'], function(err, user) {
          if (err) {
            return callback(err);
          }
          return callback(null, user);
        });
      }
    ],
    comments: [
      'post',
      function commentsFn(callback) {
        PostV1.listCommentByPost(postId, 0, null, callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    var post = results.post;
    post.likes = results.likes;
    post.comments = results.comments;
    post.author = results.author;
    return cb(null, post);
  });
};

/**
 * 在社交圈发布动态
 * @param     {Object}    post        要发布的动态
 * @param     {function}  cb          回调函数
 * @return    {string}    postId      动态ID
 */
exports.createPost = function(post, cb) {
  async.auto({
    post: function postFn(callback) {
      Post.create(post).exec(callback);
    },
    timeline: [
      'post',
      function timelineFn(callback, result) {
        UserTimeline.create({
          user: result.post.author,
          type: 'createpost',
          content: {
            template: 'create_post',
            data: {
              title: result.post.title ? result.post.title : '无题',
              post: result.post.id
            }
          }
        }).exec(callback);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, {
      postId: results.post.id
    });
  });
};

/**
 * 动态的评论列表
 * @param {string}    postId      动态ID
 * @param {integer}   skip        跳过记录数
 * @param {date}      lastdate    最后更新时间
 * @param {Function}  cb          回调函数
 */
exports.listCommentByPost = function(postId, skip, lastdate, cb) {
  var filterObj = {
    where: {
      post: postId,
      enabled: true
    },
    limit: Constant.listLimit,
    skip: skip,
    sort: 'createdAt desc'
  };
  async.auto({
    check: function checkFn(callback) {
      Post.findOne(postId).exec(function(err, post) {
        if (err) {
          return callback(err);
        }
        if (_.isEmpty(post)) {
          return callback(Utils.error(400032));
        }
        return callback(null, true);
      });
    },
    total: ['check',
      function totalFn(callback) {
        Comment.count(filterObj.where).exec(callback);
      }
    ],
    list: ['total', function listFn(callback, result) {
      if (!result.total) {
        return callback(null, []);
      }
      if (lastdate) {
        filterObj.where.createdAt = {
          '>': lastdate
        };
      }
      Comment.find(filterObj).exec(function(err, comments) {
        if (err) {
          return callback(err);
        }
        var authorIds = _.pluck(comments, 'author');
        User.withIds(authorIds, null, ['info'], function(_err, authors) {
          if (_err) {
            return callback(_err);
          }

          async.map(comments, function(cobj, innercb) {
            cobj.author = authors[cobj.author];

            return innercb(null, cobj);
          }, callback);
        });
      });
    }]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    delete results.check;
    return cb(null, results);
  });
};

/**
 * 动态下发表回复
 * @param     {string}    userId      用户ID
 * @param     {string}    postId      动态ID
 * @param     {integer}   to          回复楼层
 * @param     {string}    content     回复内容
 * @param     {function}  cb          回调函数
 * @return    {Comment}   回复对象
 */
exports.createComment = function(userId, postId, to, content, cb) {
  async.auto({
    check: function checkFn(callback) {
      Post.findOne(postId).exec(function(err, post) {
        if (err) {
          return callback(err);
        }
        if (!post) {
          return callback(Utils.error(400032));
        }
        return callback(null, post.disableComment);
      });
    },
    comment: ['check', function commentFn(callback, result) {
      if (result.check) {
        return callback(null, null);
      }
      Comment.create({
        post: postId,
        to: to,
        author: userId,
        content: content
      }).exec(callback);
    }]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    if (results.check) {
      return cb(Utils.error(400031));
    }
    return cb(null, results.comment);
  });
};

/**
 * 获取动态的点赞列表
 * @param  {string}     postId 动态ID
 * @param  {integer}    skip   跳过记录数
 * @param  {Function}   cb     回调函数
 * @return {Object}          {total, list}
 */
exports.postLikes = function(postId, skip, cb) {
  PostLike.byPost(postId, skip, cb);
};

/**
 * 给动态点赞
 * @param     {string}    userId      用户ID
 * @param     {string}    postId      动态ID
 * @param     {function}  cb          回调函数
 * @return    {string}    执行结果
 */
exports.likePost = function(userId, postId, cb) {
  var obj = {
    user: userId,
    post: postId
  };
  PostLike.findOrCreate(obj).exec(function(err) {
    if (err) {
      return cb(err);
    }
    return cb(null, {
      status: 'like_success'
    });
  });
};

/**
 * 给动态取消点赞
 * @param     {string}    userId      用户ID
 * @param     {string}    postId      动态ID
 * @param     {function}  cb          回调函数
 * @return    {string}    执行结果
 */
exports.unlikePost = function(userId, postId, cb) {
  var obj = {
    user: userId,
    post: postId
  };
  PostLike.destroy(obj).exec(function(err) {
    if (err) {
      return cb(err);
    }
    return cb(null, {
      status: 'unlike_success'
    });
  });
};

function makeCache(userId, cb) {
  var moment = require('moment'),
    endDate = moment().subtract(1, 'days').endOf('day'),
    startDate = endDate.add(7, 'days').startOf('day');

  function processPost(whereObj, limit, callback) {
    var filterObj = {
      where: whereObj,
      select: ['id']
    };
    Post.find(filterObj).exec(function(err, posts) {
      if (err) {
        return callback(err);
      }
      if (_.isEmpty(posts)) {
        return callback(null, []);
      }

      var ids = _.uniq(_.pluck(posts, 'id'));
      filterObj = {
        where: {
          post: ids
        },
        sort: {
          'hotCount': 'DESC'
        },
        select: ['post']
      };
      if (limit) {
        filterObj.limit = limit;
      }
      PostCount.find(filterObj).exec(function(_err, result) {
        if (_err) {
          return callback(_err);
        }
        ids = _.uniq(_.pluck(result, 'id'));
        return callback(null, ids);
      });
    });
  }

  async.auto({
    groupIds: function groupIdsFn(callback) {
      Group.listPublicAndUserGroupIds(userId, function(err, ids) {
        if (err) {
          return callback(err);
        }
        return callback(null, ids);
      });
    },
    favSports: function favSportsFn(callback) {
      UserInfo.findOne({
        where: {
          id: userId
        },
        select: ['favoriteSports']
      }).exec(function(err, uiObj) {
        if (err) {
          return callback(err);
        }
        return callback(null, uiObj.favoriteSports);
      });
    },
    // 我关注的人点赞+评论数量最多的20条
    friends: [
      'groupIds',
      function friendsFn(callback, result) {
        UserRelation.findOne(userId).exec(function(err, urObj) {
          if (err) {
            return callback(err);
          }
          var friends = _.pluck(urObj.friends, 'id');
          var whereObj = {
            author: friends,
            group: result.groupIds,
            createdAt: {
              '>=': startDate.toDate(),
              '<=': endDate.toDate()
            }
          };
          processPost(whereObj, 20, callback);
        });
      }
    ],
    // 我加入的圈子点赞+评论数量最多的20条
    groups: function groupsFn(callback) {
      Group.listUserGroupIds(userId, function(err, groupIds) {
        if (err) {
          return callback(err);
        }

        var whereObj = {
          group: groupIds,
          createdAt: {
            '>=': startDate.toDate(),
            '<=': endDate.toDate()
          }
        };
        processPost(whereObj, 20, callback);
      });
    },
    // 我喜欢的运动的所有相关动态
    sports: [
      'groupIds',
      'favSports',
      function sportsFn(callback, result) {
        if (_.isEmpty(result.favSports)) {
          return callback(null, []);
        }

        var whereObj = {
          group: result.groupIds,
          category: result.favSports,
          createdAt: {
            '>=': startDate.toDate(),
            '<=': endDate.toDate()
          }
        };
        processPost(whereObj, 0, callback);
      }
    ],
    // 与我喜欢的运动无关的点赞+评论数量最多的前10条
    others: [
      'groupIds',
      'favSports',
      function othersFn(callback, result) {
        var whereObj = {
          group: result.groupIds,
          category: {
            '!': result.favSports
          },
          createdAt: {
            '>=': startDate.toDate(),
            '<=': endDate.toDate()
          }
        };
        processPost(whereObj, 10, callback);
      }
    ],
    list: [
      'friends',
      'groups',
      'sports',
      'others',
      function listFn(callback, result) {
        var ids = _.uniq(_.union(result.friends, result.groups, result.sports, result.others));
        return callback(null, ids);
      }
    ]
  }, function(err, results) {
    if (err) {
      return cb(err);
    }
    return cb(null, results.list);
  });
}
