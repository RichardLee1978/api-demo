/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {
  // jscs:disable maximumLineLength
  'post /oauth/client': 'Client.create',
  'put /oauth/client': 'Client.update',

  'get /v1/orderNo': 'ApiV1.orderNo',
  'post /v1/payment/charge': 'PaymentV1.createCharge',
  'post /v1/payment/events': 'PaymentV1.createEvent',
  'get /v1/payment/alipay/:type': 'PaymentV1.createAlipaySyncEvent',

  'get /v1/venues': 'ApiV1.venueList',
  'get /v1/venues/:venueId/:lat/:lng': 'ApiV1.venueDetail',
  'get /v1/eventPlan/:id/:day/:time/:duration': 'ApiV1.eventPlan',

  'post /v1/sportsOrders': 'ApiV1.createSportsOrder',
  'get /v1/sportsOrders': 'ApiV1.sportsOrderList',
  'get /v1/sportsOrders/:id': 'ApiV1.sportsOrderDetail',
  'put /v1/sportsOrders/:id': 'ApiV1.processOrder', // p3

  'post /v1/coachOrders': 'ApiV1.createCoachOrder', // p3
  'get /v1/coachOrders': 'ApiV1.coachOrderList', // p3
  'get /v1/coachOrders/:id': 'ApiV1.coachOrderDetail', // p3
  'put /v1/coachOrders/:id': 'ApiV1.processOrder', // p3

  'get /v1/orderTime/:id': 'ApiV1.orderTime',

  'delete /v1/cancelSportsOrder/:id': 'ApiV1.interfaceIsRemove',
  'get /v1/sportsOrderTime/:id': 'ApiV1.interfaceIsRemove',

  'post /v1/user/exists': 'ApiV1.checkUserNameExists',
  'post /v1/verification/:type': 'ApiV1.verificationCode',
  'post /v1/user': 'ApiV1.userRegister',
  'put /v1/user': 'ApiV1.updateUserInfo', // p2
  'put /v1/user/password': 'ApiV1.changePassword',
  'get r|^/v1/user(/?)(\\w*)$|,id': 'ApiV1.userInfo',
  'get r|^/v1/user(/?)(\\w*)/relation/(\\w+)$|,id,type': 'ApiV1.relation', // p2
  'get r|^/v1/user(/?)(\\w*)/groups$|,id': 'ApiV1.userGroups', // p2
  'get r|^/v1/user(/?)(\\w*)/timeline$|,id': 'ApiV1.timeline', // p2
  'get /v1/user/likes/:type': 'ApiV1.userLikes', // p2
  'put /v1/user/device/:app': 'ApiV1.registerDevice', // p2
  'delete /v1/user/device/:app': 'ApiV1.removeDevice', // p2
  'post /v1/user/search': 'ApiV1.searchUserByUsername',

  'post /v1/user/account/:type': 'ApiV1.linkThirdParty', // p2
  'put /v1/user/account/:type': 'ApiV1.updateThirdParty', // p2
  'delete /v1/user/account/:type': 'ApiV1.removeThirdParty', // p2

  'get /v1/info/qiniu/:type': 'Qiniu.uploadToken',
  'get /v1/info': 'ApiV1.info',
  'get /v1/info/system': 'ApiV1.systemInfo',
  'get /v1/info/categories': 'ApiV1.categories',
  'get /v1/info/cities': 'ApiV1.cities',
  'get /v1/info/districts': 'ApiV1.districts',
  'get /v1/info/time': 'ApiV1.time',
  'get /v1/info/cases': 'ApiV1.cases',
  'get /v1/info/targets': 'ApiV1.targets',
  'get /v1/info/userStatus': 'ApiV1.userStatus',
  'get /v1/info/coachStatus': 'ApiV1.coachStatus',
  'get /v1/info/errorDescription': 'ApiV1.errorDescription',

  'get /v1/nearPeople': 'ApiV1.nearbyPeople', // p2
  'get /v1/noLoginNearPeople': 'ApiV1.noLoginNearbyPeople', // p2
  'get /v1/groups': 'ApiV1.groups', // p2
  'get /v1/square/:type': 'ApiV1.square', // p2
  'get /v1/public': 'ApiV1.public', // p2
  'get /v1/groups/:groupId': 'ApiV1.groupDetail', // p2
  'get /v1/groups/:groupId/members': 'ApiV1.groupMembers', // p2
  'post /v1/groups/:groupId': 'ApiV1.followGroup', // p2
  'delete /v1/groups/:groupId': 'ApiV1.unfollowGroup', // p2
  'get /v1/groups/:groupId/posts': 'ApiV1.posts', // p2
  'post /v1/groups/:groupId/posts': 'ApiV1.createPost', // p2
  'post /v1/posts': 'ApiV1.createPost',
  'get /v1/posts/:postId': 'ApiV1.postDetail', // p2
  'get /v1/posts/:postId/like': 'ApiV1.postLikes', // p2
  'get /v1/posts/:postId/comment': 'ApiV1.listCommentByPost', // p2
  'post /v1/posts/:postId/comment': 'ApiV1.createComment', // p2
  'post /v1/posts/:postId/like': 'ApiV1.likePost', // p2
  'delete /v1/posts/:postId/like': 'ApiV1.unlikePost', // p2
  'post /v1/friends/:followId': 'ApiV1.followUser', // p2
  'delete /v1/friends/:unfollowId': 'ApiV1.unfollowUser', // p2
  'post /v1/user/:blockId/block': 'ApiV1.blockUser', // p2
  'delete /v1/user/:blockId/block': 'ApiV1.unblockUser', // p2
  'post /v1/channel/:channelId': 'ApiV1.userCreatedChannel', // p2
  'put /v1/channel/:channelId': 'ApiV1.updateUserChannel', // p2
  'delete /v1/channel/:channelId': 'ApiV1.dismissUserChannel', // p2
  'post r|^/v1/channel/(\\w*)/members(/?)(\\w*)$|channelId,,memberId': 'ApiV1.addMemberToUserChannel', // p2
  'delete /v1/channel/:channelId/members/:memberId': 'ApiV1.removeMemberFromUserChannel', // p2
  'post /v1/channel/:channelId/invite': 'ApiV1.inviteMemberToUserChannel', // p2
  'delete /v1/channel/:channelId/members': 'ApiV1.memberLeaveChannel', // p2
  'post /v1/favorite/:type/:id': 'ApiV1.favorite', // p2
  'delete /v1/favorite/:type/:id': 'ApiV1.unFavorite', // p2

  'get /v1/tag': 'ApiV1.taglist', // p2
  'post /v1/tag': 'ApiV1.newTag', // p2

  'get /v1/nearCoach': 'ApiV1.nearbyCoach', // p3

  /* Coach */
  'get r|^/v1/coach(/?)(\\w*)$|,id': 'CoachV1.coachInfo', // p3
  'put r|^/v1/coach': 'CoachV1.modifyCoachInfo',
  'get r|^/v1/coach(/?)(\\w*)/schedule$|,id': 'CoachV1.scheduleList', // p3
  'get r|^/v1/coach(/?)(\\w*)/price$|,id': 'CoachV1.coachPrice', // p3
  'put r|^/v1/coach(/?)(\\w*)/price$|,id': 'CoachV1.modifyCoachPrice', // p3
  'get r|^/v1/coach(/?)(\\w*)/order$|,id': 'CoachV1.orderList', // p3
  'get /v1/coach/order/:id': 'CoachV1.orderDetail', // p3
  'put /v1/coach/order/:id': 'CoachV1.modifyOrderDetail',
  'get r|^/v1/coach(/?)(\\w*)/serviceTime$|,id': 'CoachV1.serviceTime', // p3
  'put r|^/v1/coach(/?)(\\w*)/serviceTime$|,id': 'CoachV1.modifyServiceTime', // p3
  'get /v1/coach/:coachId/beforeOrder': 'CoachV1.beforeOrder', // p3
  'get /v1/coach/location': 'CoachV1.customLocationList',
  'post /v1/coach/location': 'CoachV1.createCustomLocation',
  'put /v1/coach/location/:id': 'CoachV1.updateCustomLocation',
  'delete /v1/coach/location/:id': 'CoachV1.removeCustomLocation',

  /* Back-end */
  'get /backend/venue': 'Venue.venueList',
  'get /backend/venue/:venueId': 'Venue.venueDetail',
  'post /backend/venue': 'Venue.createVenue',
  'put /backend/venue/:venueId': 'Venue.updateVenue',
  'get /backend/venue/:venueId/event/:eventId': 'Event.eventDetail',
  'post /backend/venue/:venueId/event': 'Event.createEvent',
  'put /backend/venue/:venueId/event/:eventId': 'Event.updateEvent',
  'get /backend/venue/:venueId/event/:eventId/ground/:groundId': 'Ground.groundDetail',
  'post /backend/venue/:venueId/event/:eventId/ground': 'Ground.createGround',
  'put /backend/venue/:venueId/event/:eventId/ground/:groundId': 'Ground.updateGround',
  'post /backend/venue/:venueId/event/:eventId/ground/:groundId/charge': 'Ground.createGroundCharge',
  'get /backend/coach': 'Coach.coachList',
  'get /backend/coach/:coachId': 'Coach.coachDetail',
  'post /backend/coach': 'Coach.createVerifyCoach',
  'post /backend/coach/:userId': 'Coach.verifyCoachFromUser',
  'put /backend/coach/:coachId': 'Coach.updateCoachInfo',
  'delete /backend/coach/:coachId': 'Coach.disableCoach',
  'get /backend/sportsOrder': 'SportsOrder.orderList',
  'get /backend/sportsOrder/:orderId': 'SportsOrder.orderDetail',
  'get /backend/coachOrder': 'CoachOrder.orderList',
  'get /backend/coachOrder/:orderId': 'CoachOrder.orderDetail',

  'post /backend/businesscontacts/:type': 'Business.createContact',
  'get /backend/businesscontacts/:type': 'Business.contactList',

  'get /backend/wechat/user': 'WeChat.userInfo',
  'post /backend/wechat/user': 'WeChat.registerUser',
  'post /backend/wechat/user/login': 'WeChat.userLogin',
  'post /backend/wechat/user/link': 'WeChat.linkUser',
  'get /backend/wechat/activity': 'WeChat.activityInfo',
  'get /backend/wechat/activity/participants': 'WeChat.activityParticipants',
  'post /backend/wechat/activityOrder': 'WeChat.createActivityOrder'
};
