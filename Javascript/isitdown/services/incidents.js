'use strict';
var path = require('path');
var filesystem = require('fs');
var config = require(path.join(__dirname, '../config'));
var request = require('request');

var IncidentCalendar = {
    request: request,
    /**
     * get: Acts as a wrapper for the incident calendar. This could connect to an API to 
     * fetch incidents per date for a calendar year.
     */
    get: (interval, callback) => {
        var obj = this;
        /**
           Normally there would be a request made here for data that could be parsed.
           Instead, we're going to poll a flat file.
         */
        var requestData
        if (interval == 'daily') {
            requestData = filesystem.readFileSync(path.join(__dirname, 'data/incidencalendar.csv'));
        } else if (interval == 'hourly') {
            requestData = filesystem.readFileSync(path.join(__dirname, 'data/incidentsbyhour.tsv'));
        }
        var responseData = requestData;
        callback(responseData);    
    }
};
module.exports = IncidentCalendar;