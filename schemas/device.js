'use strict';

var mongoose = require('mongoose');
var shortid = require('shortid');

var Device = new mongoose.Schema({
  _id: {
    type: String,
    'default': shortid.generate
  },
  coords: { lat: Number, lng: Number },
  createDate: { type: Date, default: Date.now },
  description: String,
  email: String,
  mac: String,
  name: String
});

module.exports = Device;
