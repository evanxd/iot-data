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
    if (data.coords && data.description && data.email && data.mac && data.name) {
      var device = new Device({
        coords: JSON.parse(data.coords),
        description: data.description,
        email: data.email,
        mac: data.mac,
        name: data.name
      });
      device.save(function (err) {
        !err ? res.jsonp({ result: 'success' }) : res.jsonp({ result: 'fail', message: err });
      });
    } else {
      res.jsonp({ result: 'fail', message: 'Some must input data is missed.' });
    }
  },

  getDevices: function(req, res, next) {
    var deviceId = req.params.deviceId;
    if (deviceId) {
      Device.findOne({ _id: deviceId })
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
      return res.jsonp({ result: 'fail', message: "No data input." });
    }

    Device.findOne({ _id: deviceId }, function (err, device) {
      if (err) return res.jsonp({ result: 'fail', message: err });

      if (device) {
        var DeviceData = mongoose.model(`device-${deviceId}-data`, DeviceDataSchema);
        new DeviceData({ data: data }).save(function (err) {
          !err ? res.jsonp({ result: 'success' }) : res.jsonp({ result: 'fail', message: err });
        });
      } else {
        res.jsonp({ result: 'fail', message: "No such device ID." });
      }
    });
  },

  getDeviceData: function(req, res, next) {
    var deviceId = req.params.deviceId;
    var DeviceData = mongoose.model(`device-${deviceId}-data`, DeviceDataSchema);
    DeviceData.find({})
      .select({ _id: 0, data: 1, date: 1 })
      .limit(config.dataLimit)
      .sort({ datetime: -1 })
      .exec(function(err, data) {
        if (err) return res.jsonp({ result: 'fail', message: err });
        res.jsonp(data);
      });
  }
};

module.exports = new Devices();
