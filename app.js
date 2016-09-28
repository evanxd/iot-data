'use strict';

var bodyParser = require('body-parser');
var express = require('express');
var mongoose = require('mongoose');
var config = require('./config.js');
var devices = require('./lib/devices');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods: POST');
  res.header('Access-Control-Max-Age: 1000');
  next();
});

var db = mongoose.connection;
mongoose.connect('mongodb://localhost/iot-data');

db.once('open', function() {
  app.route('/').get(function(req, res, next) {
    res.jsonp({
      version: config.version,
      description: config.description,
      status: 'open'
    });
  });

  app.route('/devices')
    .post(devices.addDevice);

  app.route('/devices/:deviceId')
    .get(devices.getDevices);

  app.route('/devices/:deviceId/data')
    .get(devices.getDeviceData)
    .post(devices.addDeviceData);
});

db.on('error', function(err) {
  app.route('/').get(function(req, res, next) {
    res.jsonp({
      version: config.version,
      description: err,
      status: 'close'
    });
  });
});

app.listen(config.express.port);
console.log('Listening on port ' + config.express.port);
