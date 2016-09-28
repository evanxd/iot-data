'use strict';

var mongoose = require('mongoose');

var DeviceData = new mongoose.Schema({
  data: {},
  date: { type: Date, default: Date.now }
});

module.exports = DeviceData;
