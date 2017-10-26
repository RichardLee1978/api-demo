'use strict';

module.exports = {
  validateLocation: function(location, cb) {
    if (!location.longitude || !location.latitude || !location.name || !location.address) {
      return cb(Utils.error(400001));
    }

    return cb(null);
  },
  removeCustomLocation: function(id, userId, cb) {
    CustomLocation.findOne({
      id: id,
      enabled: true
    }).exec(function(err, location) {
      if (err) {
        return cb(err);
      }

      if (!location) {
        return cb(Utils.error(400011));
      }

      if (userId !== location.user) {
        return cb(Utils.error(400010));
      }

      location.enabled = false;
      location.save(cb);
    });
  },
  createCustomLocation: function(userId, location, cb) {
    var self = this;
    async.auto({
      validate: function validateFn(done) {
        self.validateLocation(location, done);
      },
      check: function checkFn(done) {
        CustomLocation.findOne({
          user: userId,
          name: location.name
        }).exec(function(err, loc) {
          if (err) {
            return done(err);
          }
          if (loc) {
            return done(Utils.error(400023));
          }
          done(null);
        });
      },
      create: [
        'validate',
        'check',
        function createFn(done) {
          CustomLocation.create({
            user: userId,
            longitude: location.longitude,
            latitude: location.latitude,
            name: location.name,
            address: location.address,
            public: location.public
          }).exec(done);
        }
      ]
    }, function(err, results) {
      if (err) {
        return cb(err);
      }
      return cb(null, results.create);
    });
  },
  updateCustomLocation: function(id, userId, location, cb) {
    var self = this;
    async.auto({
      validate: function validateFn(done) {
        self.validateLocation(location, done);
      },
      check: function checkFn(done) {
        CustomLocation.findOne(id).exec(function(err, customLocation) {
          if (err) {
            return done(err);
          }
          if (!customLocation) {
            return done(Utils.error(400011));
          }
          if (customLocation.user !== userId) {
            return done(Utils.error(400010));
          }

          done(null);
        });
      },
      update: [
        'validate',
        'check',
        function(done) {
          CustomLocation.update(id, location).exec(done);
        }
      ]
    }, function(err, result) {
      if (err) {
        return cb(err);
      }

      return cb(null, result.update[0]);
    });
  },
  customLocationList: function(userId, cb) {
    CustomLocation.find({
      user: userId,
      enabled: true
    }).sort('createdAt desc').exec(cb);
  }
};
