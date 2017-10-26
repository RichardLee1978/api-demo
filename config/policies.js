/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.policies.html
 */

module.exports.policies = {
  '*': true,

  ClientController: {
    '*': true,
    update: ['oauthBearer', 'clientresource']
  },
  QiniuController: {
    '*': true,
    uploadToken: ['oauthBearer', 'clientresource']
  },
  PaymentV1Controller: {
    '*': false,
    'createCharge': ['oauthBearer', 'userlocation', 'clientresource'],
    'createEvent': true,
    'createAlipaySyncEvent': true
  },
  WeChatController: {
    '*': false,
    'userInfo': ['oauthBearer', 'userlocation', 'clientresource'],
    'registerUser': ['oauthBearer', 'userlocation', 'clientresource'],
    'userLogin': ['oauthBearer', 'userlocation', 'clientresource'],
    'linkUser': ['oauthBearer', 'userlocation', 'clientresource'],
    'activityInfo': ['oauthBearer', 'userlocation', 'clientresource'],
    'activityParticipants': ['oauthBearer', 'userlocation', 'clientresource'],
    'createActivityOrder': ['oauthBearer', 'userlocation', 'clientresource']
  },
  ApiV1Controller: {
    '*': false,
    'interfaceIsRemove': ['oauthBearer', 'userlocation', 'userresource'],

    'orderNo': ['oauthBearer', 'userlocation', 'clientresource'],

    'info': ['oauthBearer', 'userlocation', 'clientresource'],
    'systemInfo': ['oauthBearer', 'userlocation', 'clientresource'],
    'categories': ['oauthBearer', 'userlocation', 'clientresource'],
    'cities': ['oauthBearer', 'userlocation', 'clientresource'],
    'districts': ['oauthBearer', 'userlocation', 'clientresource'],
    'time': ['oauthBearer', 'userlocation', 'clientresource'],
    'cases': ['oauthBearer', 'userlocation', 'clientresource'],
    'targets': ['oauthBearer', 'userlocation', 'clientresource'],
    'userStatus': ['oauthBearer', 'userlocation', 'clientresource'],
    'coachStatus': ['oauthBearer', 'userlocation', 'clientresource'],
    'errorDescription': ['oauthBearer', 'userlocation', 'clientresource'],

    'venueList': ['oauthBearer', 'userlocation', 'clientresource'],
    'venueDetail': ['oauthBearer', 'userlocation', 'clientresource'],
    'eventPlan': ['oauthBearer', 'userlocation', 'clientresource'],
    'verificationCode': ['oauthBearer', 'userlocation', 'clientresource'],
    'checkUserNameExists': ['oauthBearer', 'userlocation', 'clientresource'],
    'userRegister': ['oauthBearer', 'userlocation', 'clientresource'],
    'noLoginNearbyPeople': ['oauthBearer', 'clientresource'],
    'changePassword': ['oauthBearer', 'userlocation', 'clientresource'],
    'public': ['oauthBearer', 'userlocation', 'clientresource'],
    'registerDevice': ['oauthBearer', 'userlocation', 'clientresource'],
    'removeDevice': ['oauthBearer', 'userlocation', 'clientresource'],

    'createSportsOrder': ['oauthBearer', 'userlocation', 'userresource'],
    'sportsOrderList': ['oauthBearer', 'userlocation', 'userresource'],
    'sportsOrderDetail': ['oauthBearer', 'userlocation', 'userresource'],

    'createCoachOrder': ['oauthBearer', 'userlocation', 'userresource'],
    'coachOrderList': ['oauthBearer', 'userlocation', 'userresource'],
    'coachOrderDetail': ['oauthBearer', 'userlocation', 'userresource'],

    'processOrder': ['oauthBearer', 'userlocation', 'userresource'],

    'orderTime': ['oauthBearer', 'userlocation', 'userresource'],

    'searchUserByUsername': ['oauthBearer', 'userlocation', 'userresource'],
    'updateUserInfo': ['oauthBearer', 'userlocation', 'userresource'],
    'userInfo': ['oauthBearer', 'userlocation', 'userresource'],
    'nearbyPeople': ['oauthBearer', 'userlocation', 'userresource'],
    'groups': ['oauthBearer', 'userlocation', 'userresource'],
    'groupDetail': ['oauthBearer', 'userlocation', 'userresource'],
    'groupMembers': ['oauthBearer', 'userlocation', 'userresource'],
    'userGroups': ['oauthBearer', 'userlocation', 'userresource'],
    'followGroup': ['oauthBearer', 'userlocation', 'userresource'],
    'unfollowGroup': ['oauthBearer', 'userlocation', 'userresource'],
    'posts': ['oauthBearer', 'userlocation', 'userresource'],
    'postDetail': ['oauthBearer', 'userlocation', 'userresource'],
    'createPost': ['oauthBearer', 'userlocation', 'userresource'],
    'listCommentByPost': ['oauthBearer', 'userlocation', 'userresource'],
    'createComment': ['oauthBearer', 'userlocation', 'userresource'],
    'likePost': ['oauthBearer', 'userlocation', 'userresource'],
    'unlikePost': ['oauthBearer', 'userlocation', 'userresource'],
    'postLikes': ['oauthBearer', 'userlocation', 'userresource'],
    'followUser': ['oauthBearer', 'userlocation', 'userresource'],
    'unfollowUser': ['oauthBearer', 'userlocation', 'userresource'],
    'timeline': ['oauthBearer', 'userlocation', 'userresource'],
    'taglist': ['oauthBearer', 'userlocation', 'userresource'],
    'newTag': ['oauthBearer', 'userlocation', 'userresource'],
    'userLikes': ['oauthBearer', 'userlocation', 'userresource'],
    'relation': ['oauthBearer', 'userlocation', 'userresource'],
    'square': ['oauthBearer', 'userlocation', 'userresource'],
    'userCreatedChannel': ['oauthBearer', 'userlocation', 'userresource'],
    'updateUserChannel': ['oauthBearer', 'userlocation', 'userresource'],
    'dismissUserChannel': ['oauthBearer', 'userlocation', 'userresource'],
    'addMemberToUserChannel': ['oauthBearer', 'userlocation', 'userresource'],
    'removeMemberFromUserChannel': ['oauthBearer', 'userlocation', 'userresource'],
    'inviteMemberToUserChannel': ['oauthBearer', 'userlocation', 'userresource'],
    'memberLeaveChannel': ['oauthBearer', 'userlocation', 'userresource'],
    'linkThirdParty': ['oauthBearer', 'userlocation', 'userresource'],
    'updateThirdParty': ['oauthBearer', 'userlocation', 'userresource'],
    'removeThirdParty': ['oauthBearer', 'userlocation', 'userresource'],
    'blockUser': ['oauthBearer', 'userlocation', 'userresource'],
    'unblockUser': ['oauthBearer', 'userlocation', 'userresource'],
    'favorite': ['oauthBearer', 'userlocation', 'userresource'],
    'unFavorite': ['oauthBearer', 'userlocation', 'userresource'],

    'nearbyCoach': ['oauthBearer', 'userlocation', 'userresource']
  },

  CoachV1Controller: {
    '*': false,
    'coachInfo': ['oauthBearer', 'userlocation', 'userresource'],
    'modifyCoachInfo': ['oauthBearer', 'userlocation', 'coachresource'],
    'beforeOrder': ['oauthBearer', 'userlocation', 'userresource'],
    'serviceTime': ['oauthBearer', 'userlocation', 'coachresource'],
    'modifyServiceTime': ['oauthBearer', 'userlocation', 'coachresource'],
    'scheduleList': ['oauthBearer', 'userlocation', 'coachresource'],
    'customLocationList': ['oauthBearer', 'userlocation', 'coachresource'],
    'createCustomLocation': ['oauthBearer', 'userlocation', 'coachresource'],
    'updateCustomLocation': ['oauthBearer', 'userlocation', 'coachresource'],
    'removeCustomLocation': ['oauthBearer', 'userlocation', 'coachresource'],
    'orderList': ['oauthBearer', 'userlocation', 'coachresource'],
    'orderDetail': ['oauthBearer', 'userlocation', 'coachresource'],
    'coachPrice': ['oauthBearer', 'userlocation', 'coachresource'],
    'modifyCoachPrice': ['oauthBearer', 'userlocation', 'coachresource'],
    'modifyOrderDetail': ['oauthBearer', 'userlocation', 'coachresource']
  }
};
