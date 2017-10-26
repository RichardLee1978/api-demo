/**
* BusinessContacts.js
*
* @description :: 商务联系类
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  schema: true,
  autoPK: false,

  attributes: {
    id: {
      type: 'string',
      primaryKey: true
    },
    type: {
      type: 'string',
      defaultsTo: ''
    },
    name: {
      type: 'string',
      defaultsTo: ''
    },
    phone: {
      type: 'string',
      defaultsTo: ''
    },
    city: {
      model: 'city'
    },
    district: {
      model: 'CityDistrict'
    },
    address: {
      type: 'string',
      defaultsTo: ''
    },
    process: {
      type: 'boolean',
      defaultsTo: false
    }
  }
};
