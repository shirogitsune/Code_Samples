'use strict';
var path = require('path');
var filesystem = require('fs');
var config = require(path.join(__dirname, '../config'));
var request = require('request');

var ServiceStatusService = {
    request: request,
    /**
     * get: Acts as a wrapper for the service status backends. This could connect to a APIs on 
     * Event 24x7, Solarwinds, or other reporting interfaces to get information about our systems.
     */
    get: (location, callback) => {
        var obj = this;
        /**
           Normally there would be a request made here for data that could be parsed.
           Instead, we're going to poll a flat file.
         */
        var requestData = filesystem.readFileSync(path.join(__dirname, 'data/services.json'));
        var responseData = JSON.parse(requestData);
        if (location === 'all') {
            callback(responseData);    
        } else {
            callback(responseData[location]);
        }
    }
};
module.exports = ServiceStatusService;