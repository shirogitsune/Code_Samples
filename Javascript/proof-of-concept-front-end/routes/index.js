/* global process:false */
/* Default Stub File */
'use strict';
var path = require('path');
var config = require(path.join(__dirname, '../config'));
var express = require('express');
var argsv = require(path.join(__dirname, '../middleware/arguments'));
var router = express.Router();

module.exports = function (app, passport) { 
    
    /**
     * Route for homepage.
     */
    router.get('/', function (req, res, next) {
        var user = req.user || {};
        res.render(path.join(__dirname, '../index'), {
            userEmail: user.email || '',
            userId: user.user_id || ''
        });
    });
    
    /**
     * Route to handle posting login information.
     */
    router.post('/login', passport.authenticate('local-login', {
        successRedirect: '/#/profile',
        failureRedirect: '/#/login',
        failureFlash: false 
    }));
    
    /**
     * Route to handle logout/
     */
    router.get('/logout', function (req, res, next) {
        req.logout();
        req.session.destroy();
        res.redirect('/');
    });

    /**
     * Get the endpoints from the config and expose them to the UI
     */
    router.get('/endpoints', function (req, res, next) {
       var args = argsv.parse(process.argv.slice(2));
       var hostname = req.hostname;
       var proto = req.protocol + '://';
       var port = args.serviceport || config.servicePort;
       for (var k in config.endpoints) {
           if (config.endpoints.hasOwnProperty(k)) {
               config.endpoints[k] = config.endpoints[k].replace(/\{HOSTPROTO\}/g, proto + '' + hostname);
               config.endpoints[k] = config.endpoints[k].replace(/\{SERVICEPORT\}/g, port);
           }
       }
       res.status(200).send('angular.module(\'' + config.applicationname + '\').constant(\'endpoints\', ' + JSON.stringify(config.endpoints) + ');');
    });

    return router;
};