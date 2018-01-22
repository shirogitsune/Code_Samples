'use strict';
var path = require('path');
var config = require(path.join(__dirname, '../config'));
var services = require(path.join(__dirname, '../services/servstat.js'));
var oncall = require(path.join(__dirname, '../services/oncall.js'));
var incidents = require(path.join(__dirname, '../services/incidents.js'));

var express = require('express');
var router = express.Router();

module.exports = function(app) {
    /**
     * Handle default / path and display the index.
     */
    router.get('/', function(req, res, next){
        res.render(path.join(__dirname, '../views/index'));
    });

    /**
     * Handle path for getting to the incident calendar
     */
    router.get('/incidentcalendar', function(req, res, next){
        res.render(path.join(__dirname, '../views/incidents'));
    });

    /**
     * Handle the requests for getting data from the incidents calendar.
     */
    router.get('/incidents', function(req, res, next) {
        incidents.get('daily', function(data) {
            res.render(path.join(__dirname, '../views/raw'), {
                data: data
            });
        });
    });

    /**
     * Handle the requests for getting data from the incidents calendar.
     */
    router.get('/incidentsbyhour', function(req, res, next) {
        res.render(path.join(__dirname, '../views/incidentshourly'));
    });

    /**
     * Handle the requests for getting data from the incidents calendar.
     */
    router.get('/incidentshourly', function(req, res, next) {
        incidents.get('hourly', function(data) {
            res.render(path.join(__dirname, '../views/raw'), {
                data: data
            });
        });
    });

    /**
     * Handle the requests for getting the data from the service status system and combining that data with the 
      on call lists.
     */
    router.get('/servicestatus', function(req, res, next) {
        var statusTree = {"name":"Footlocker Network Status", "children":[]};
        var serviceStatus = {}, onCallStatus = {};
        services.get('all', function(services) {
            serviceStatus = services;
            oncall.get(function(callData){
                onCallStatus = callData;
                for (var key in serviceStatus) {
                    if (serviceStatus.hasOwnProperty(key)) {
                        var location = serviceStatus[key], currentLocation = {"name": key.toUpperCase(), "children":[]}, resource = {};
                        for(var i=0; i<location.resources.length; i++) {
                            resource = {
                                "name": location.resources[i].address,
                                "status": location.resources[i].status,
                                "children":[],
                                "_children": []
                            };
                            if(onCallStatus[location.region][key][location.resources[i].type].primary){
                                resource._children.push({
                                    "type":"Primary",
                                    "name": onCallStatus[location.region][key][location.resources[i].type].primary.name,
                                    "email": onCallStatus[location.region][key][location.resources[i].type].primary.email,
                                    "phone": onCallStatus[location.region][key][location.resources[i].type].primary.phone
                                });
                            }
                            if(onCallStatus[location.region][key][location.resources[i].type].secondary){
                                resource._children.push({
                                    "type":"Secondary",
                                    "name": onCallStatus[location.region][key][location.resources[i].type].secondary.name,
                                    "email": onCallStatus[location.region][key][location.resources[i].type].secondary.email,
                                    "phone": onCallStatus[location.region][key][location.resources[i].type].secondary.phone
                                });
                            }
                            currentLocation.children.push(resource);
                        }
                        statusTree.children.push(currentLocation);
                    }
                }
                res.render(path.join(__dirname, '../views/raw'), {
                    data: JSON.stringify(statusTree)
                });
            });
        });
    });

    return router;
};