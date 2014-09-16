// __Dependencies__
var express = require('express');
var BaucisError = require('../BaucisError');

// __Module Definition__
var decorator = module.exports = function () {
  var controller = this;
  // Make sure the controller is activated before being requested.
  controller.use(function (request, response, next) {
    if (controller.activated()) return next();
    next(BaucisError.Configuration('The controller "%s" has not been activated', controller.plural()));
  });
  // Set up `request.baucis`.
  controller.request(function (request, response, next) {
    if (request.baucis) return next(BaucisError.Configuration('Baucis request property already created'));
    request.baucis = {};
    request.baucis.api = controller.api();
    request.baucis.controller = controller;
    if (controller.enabled('x-powered-by')) response.set('X-Powered-By', 'Baucis');
    next();
  });
};
