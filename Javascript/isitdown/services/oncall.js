'use strict';
var path = require('path');
var filesystem = require('fs');
var config = require(path.join(__dirname, '../config'));
var request = require('request');

var OnCallService = {
    request: request,
    /**
     * get: Acts as a wrapper for the on-call list. This could connect to an API to 
     * fetch on call personnel for a given area.
     */
    get: (callback) => {
        var obj = this;
        /**
           Normally there would be a request made here for data that could be parsed.
           Instead, we're going to poll a flat file.
         */
        var requestData = filesystem.readFileSync(path.join(__dirname, 'data/oncall.json'));
        var responseData = JSON.parse(requestData);
        callback(responseData);
    }
};
module.exports = OnCallService;