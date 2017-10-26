'use strict';

module.exports = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  serverError: 500,

  sms: {
    suffix: '【吾拉体育】'
  },

  IMToken: 'IMToken',

  smsTimeLimit: 60, // 短信验证码时效，60秒

  idNumberMaxLength: 18, // 证件类型最大长度
  listLimit: 15,
  maxDistance: 5000000,
  sportsOrderTimeLimit: 30, // 场馆订单付款时限
  coachOrderTimeLimit: 5, // 教练订单付款时限

  maxVideoUploadLength: 30, // 上传视频最长长度

  thirdPartyAccountType: [// 可用的第三方账号服务
    'wechat',
    'sina'
  ],

  favoriteType: [// 可以收藏的内容
    'venue',
    'user',
    'post',
    'activity'
  ],

  categoryDefine: [{
    name: 'badminton',
    lang: ['羽毛球', 'Badminton'],
    color: '8157D5',
    volume: '2-4',
    enabled: true
  }, {
    name: 'swim',
    lang: ['游泳', 'Swim'],
    color: '8157D5',
    volume: '0',
    enabled: true
  }, {
    name: 'tennis',
    lang: ['网球', 'Tennis'],
    color: '00C367',
    volume: '2-4',
    enabled: true
  }, {
    name: 'basketball',
    lang: ['篮球', 'Basketball'],
    color: 'FEAA26',
    volume: '6-10',
    enabled: true
  }, {
    name: 'ping-pong',
    lang: ['乒乓球', 'Ping-pong'],
    color: 'FEAA26',
    volume: '2-4',
    enabled: true
  }, {
    name: 'football',
    lang: ['足球', 'Football'],
    color: '00C367',
    volume: '10-22',
    enabled: true
  }, {
    name: 'snooker',
    lang: ['桌球', 'Snooker'],
    color: 'FEAA26',
    volume: '0',
    enabled: true
  }, {
    name: 'archery',
    lang: ['射箭', 'Archery'],
    color: '00C367',
    volume: '0',
    enabled: true
  }, {
    name: 'iceskating',
    lang: ['溜冰', 'Ice skating'],
    color: '8157D5',
    volume: '0',
    enabled: true
  }, {
    name: 'squash',
    lang: ['壁球', 'Squash'],
    color: 'FEAA26',
    volume: '',
    enabled: false
  }, {
    name: 'rockclimbing',
    lang: ['攀岩', 'Rock climbing'],
    color: '00C367',
    volume: '',
    enabled: false
  }, {
    name: 'bowling',
    lang: ['保龄球', 'Bowling'],
    color: 'FEAA26',
    volume: '',
    enabled: false
  }, {
    name: 'golf',
    lang: ['高尔夫球', 'Golf'],
    color: '00C367',
    volume: '',
    enabled: false
  }, {
    name: 'shooting',
    lang: ['射击', 'Shooting'],
    color: 'FEAA26',
    volume: '',
    enabled: false
  }, {
    name: 'racing',
    lang: ['赛车', 'Racing'],
    color: 'FEAA26',
    volume: '',
    enabled: false
  }, {
    name: 'volleyball',
    lang: ['排球', 'Volleyball'],
    color: '00C367',
    volume: '',
    enabled: false
  }, {
    name: 'skating',
    lang: ['轮滑', 'Skating'],
    color: '8157D5',
    volume: '',
    enabled: false
  }, {
    name: 'skateboard',
    lang: ['滑板', 'Skateboard'],
    color: '00C367',
    volume: '',
    enabled: false
  }, {
    name: 'bicycle',
    lang: ['自行车', 'Bicycle'],
    color: 'FEAA26',
    volume: '',
    enabled: false
  }, {
    name: 'skiing',
    lang: ['滑雪', 'Skiing'],
    color: '8157D5',
    volume: '',
    enabled: false
  }, {
    name: 'karting',
    lang: ['卡丁车', 'Karting'],
    color: '8157D5',
    volume: '',
    enabled: false
  }, {
    name: 'horsemanship',
    lang: ['马术', 'Horsemanship'],
    color: '00C367',
    volume: '',
    enabled: false
  }, {
    name: 'darts',
    lang: ['飞镖', 'Darts'],
    color: '8157D5',
    volume: '',
    enabled: false
  }, {
    name: 'baseball',
    lang: ['棒球', 'Baseball'],
    color: 'FEAA26',
    volume: '',
    enabled: false
  }, {
    name: 'fitness',
    lang: ['健身', 'Fitness'],
    color: '8157D5',
    volume: '',
    enabled: false
  }],

  systemInitData: [{
    key: 'version',
    type: 'ios',
    value: '1.0',
    description: 'iOS 版本',
    enabled: true
  }, {
    key: 'versionName',
    type: 'ios',
    value: '版本名',
    description: 'iOS 版本名',
    enabled: true
  }, {
    key: 'url',
    type: 'ios',
    value: 'AppleStore地址',
    description: 'iOS 版本地址',
    enabled: true
  }, {
    key: 'description',
    type: 'ios',
    value: '描述',
    description: 'iOS 版本描述',
    enabled: true
  }, {
    key: 'forceupdate',
    type: 'ios',
    value: '0',
    description: 'iOS 是否强制更新',
    enabled: true
  }, {
    key: 'version',
    type: 'android',
    value: '1',
    description: '安卓版本',
    enabled: true
  }, {
    key: 'versionName',
    type: 'android',
    value: '版本名',
    description: '安卓版本名',
    enabled: true
  }, {
    key: 'url',
    type: 'android',
    value: '',
    description: '安卓版本地址',
    enabled: true
  }, {
    key: 'description',
    type: 'android',
    value: '描述',
    description: '安卓版本描述',
    enabled: true
  }, {
    key: 'forceupdate',
    type: 'android',
    value: '0',
    description: '安卓是否强制更新',
    enabled: true
  }, {
    key: 'imagehost',
    type: 'all',
    value: '',
    description: '图片服务器路径',
    enabled: true
  }],

  VenueTestData: [{
    name: '上海体育馆',
    city: '1',
    district: '徐汇区',
    address: '漕溪北路与中山南二路交界 ',
    phone: '021-64399700',
    onlinePayment: true,
    paymentMethod: ['cash', 'alipay'],
    avgPrice: '100',
    latitude: '31.18195',
    longitude: '121.438261',
    score: '3.5'
  }, {
    name: '松江大学城体育中心',
    city: '1',
    district: '松江区',
    address: '文翔路2000号',
    phone: '021-67827272',
    onlinePayment: true,
    paymentMethod: ['cash', 'alipay'],
    avgPrice: '50',
    latitude: '31.046353',
    longitude: '121.211903',
    score: '3.5'
  }, {
    name: '源深体育馆',
    city: '1',
    district: '浦东新区',
    address: '张杨路1458号源深体育中心内(近源深路) ',
    phone: '021-58601290',
    onlinePayment: true,
    paymentMethod: ['cash', 'alipay'],
    avgPrice: '80',
    latitude: '31.231519',
    longitude: '121.537144',
    score: '3.5'
  }],
  EventTestData: [{
    category: 'tennis',
    planType: 'ground',
    planLength: '1',
    planPrice: '45',
    attention: '网球测试场地'
  }, {
    category: 'tennis',
    planType: 'ground',
    planLength: '1',
    planPrice: '75',
    attention: '网球测试场地'
  }, {
    category: 'badminton',
    planType: 'ground',
    planLength: '1',
    planPrice: '55',
    attention: '羽毛球测试场地'
  }],
  GroundTestData: [{
    displayOrder: 1,
    name: '一号场地'
  }, {
    displayOrder: 2,
    name: '二号场地'
  }],
  GroupTestData: [{
    categories: 'tennis',
    name: '网球讨论组',
    desc: '讨论网球',
    type: 'system',
    maxuser: '500',
    isPublic: true,
    invite: true,
    approval: false
  }, {
    categories: 'badminton',
    name: '羽毛球讨论组',
    desc: '讨论羽毛球',
    type: 'system',
    maxuser: '500',
    isPublic: true,
    invite: true,
    approval: false
  }],
  ShanghaiDistrictData: [{
    name: ['黄浦区', 'Huang Pu'],
    city: 1
  }, {
    name: ['徐汇区', 'Xu Hui'],
    city: 1
  }, {
    name: ['长宁区', 'Chang Ning'],
    city: 1
  }, {
    name: ['静安区', 'Jing An'],
    city: 1
  }, {
    name: ['卢湾区', 'Lu Wan'],
    city: 1
  }, {
    name: ['普陀区', 'Pu Tuo'],
    city: 1
  }, {
    name: ['闸北区', 'Zha Bei'],
    city: 1
  }, {
    name: ['虹口区', 'Hong Kou'],
    city: 1
  }, {
    name: ['杨浦区', 'Yang Pu'],
    city: 1
  }, {
    name: ['闵行区', 'Min Hang'],
    city: 1
  }, {
    name: ['宝山区', 'Bao Shan'],
    city: 1
  }, {
    name: ['浦东新区', 'Pu Dong'],
    city: 1
  }, {
    name: ['嘉定区', 'Jia Ding'],
    city: 1
  }, {
    name: ['金山区', 'Jin Shan'],
    city: 1
  }, {
    name: ['松江区', 'Song Jiang'],
    city: 1
  }, {
    name: ['青浦区', 'Qing Pu'],
    city: 1
  }, {
    name: ['奉贤区', 'Feng Xian'],
    city: 1
  }, {
    name: ['崇明区', 'Chong Ming'],
    city: 1
  }],

  trainCaseInitData: [{
    name: ['拉伸', 'Stretch']
  }, {
    name: ['产后恢复', 'Postpartum recovery']
  }, {
    name: ['体能', 'Physical']
  }, {
    name: ['搏击', 'Fighting']
  }],

  trainTargetInitData: [{
    name: ['卧推', 'Bench press'],
    unit: 'frequency'
  }, {
    name: ['大卡', 'Calories'],
    unit: 'Kcal'
  }]
};
