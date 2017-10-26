'use strict';

// var moment = require('moment');

module.exports.crontab = {
  // 每个月15号生成下个月的票仓
  // 每两个月清理一次上上个月的占用计划，转移到新表
  // 每天关闭一次已经结束的订单
  // 每1分钟关闭一次订单
  '*/1 * * * *': function log() {
    Schedule.closeTimeoutOrder(function(err, process) {
      if (err) {
        return sails.log.error(err);
      }
      if (process) {
        sails.log.info(`close ${process.sports} sportsorder,
          ${process.coach} coachorder`);
      }
    });
  },
  // 每6天更新环信token
  '0 0 */6 * *': function easemobtoken() {
    EaseMob.getToken(function(err) {
      if (err) {
        return sails.log.error(err);
      }
      sails.log.info('update easemob token success');
    });
  },
  // 每个小时更新一次 GlobalData
  '0 */1 * * *': function log() {
    GlobalData.build(function(err) {
      if (err) {
        return sails.log.error(err);
      }
      sails.log.info('GlobalData update success');
    });
  }
};
