/**
 * TicketPlan.js
 *
 * @description :: 票务占用计划
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
'use strict';

module.exports = {
  schema: true,
  autoPK: false,

  attributes: {
    id: {
      type: 'string',
      primaryKey: true
    },
    ticket: {
      model: 'ticket'
    },
    order: {
      model: 'sportsorder'
    },
    quantity: {
      type: 'integer'
    },
    // 是否可用
    enabled: {
      type: 'boolean',
      defaultsTo: true
    }
  }
};
