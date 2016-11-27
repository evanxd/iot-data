'use strict';

var mongoose = require('mongoose');
var config = require('../config.js');
var DeviceSchema = require('../schemas/device');
var DeviceDataSchema = require('../schemas/device-data');

var Device = mongoose.model('device', DeviceSchema);

function Devices() {}

Devices.prototype = {
  addDevice: function(req, res, next) {
    var data = req.body;
    if (data.lng && data.lat && data.email) {
      var device = new Device({
        coords: {
          lng: data.lng,
          lat: data.lat
        },
        description: data.description,
        email: data.email,
        name: data.name
      });
      device.save(function (err) {
        !err ? res.jsonp({ result: 'success', id: device._id }) : res.jsonp({ result: 'fail', message: err });
      });
    } else {
      res.jsonp({ result: 'fail', message: 'Some must input data is missed.' });
    }
  },

  getDevices: function(req, res, next) {
    var deviceId = req.params.deviceId;
    if (deviceId) {
      Device.findById(deviceId)
        .select({ _id: 0, description: 1, name: 1, createDate: 1, coords: 1 })
        .exec(function (err, device) {
          !err ? res.jsonp(device) : res.jsonp({ result: 'fail', message: err });
        });
    } else {
      res.jsonp({ result: 'fail', message: "No deivce ID." });
    }
  },

  addDeviceData: function(req, res, next) {
    var data = req.body;
    var deviceId = req.params.deviceId;
    var mac = data.mac;
    delete data.mac;

    if (data) {
      var value;
      var key;
      // Convert digit string to number for each `data` attribute.
      for (key in data) {
        value = Number(data[key]);
        if (!isNaN(value)) {
          data[key] = value;
        }
      }
    } else {
      res.jsonp({ result: 'fail', message: 'No data input.' });
    }

    Device.findOne({ _id: deviceId }, function (err, device) {
      err && res.jsonp({ result: 'fail', message: err });

      if (device) {
        if (!device.mac) {
          device.set('mac', mac);
          device.save(function(err) {
            err && res.jsonp({ result: 'fail', message: err });
          });
        }

        if (device.mac === mac) {
          var DeviceData = mongoose.model(`device-${deviceId}-data`, DeviceDataSchema);
          new DeviceData({ data: data }).save(function (err) {
            !err ? res.jsonp({ result: 'success' }) : res.jsonp({ result: 'fail', message: err });
          });
        } else {
          res.jsonp({ result: 'fail', message: 'The mac address is not matched.' });
        }
      } else {
        res.jsonp({ result: 'fail', message: "No such device ID." });
      }
    });
  },

  getDeviceData: function(req, res, next) {
    var where = req.query.where || 'true';
    var deviceId = req.params.deviceId;
    var DeviceData = mongoose.model(`device-${deviceId}-data`, DeviceDataSchema);
    DeviceData.find()
      .select({ _id: 0, data: 1, date: 1 })
      .limit(config.dataLimit)
      .sort({ date: -1 })
      .$where(where)
      .exec(function(err, data) {
        err && res.jsonp({ result: 'fail', message: err });
        res.jsonp(data.reverse());
      });
  }
};

module.exports = new Devices();
