'use strict';
var path = require('path');
var config = require(path.join(__dirname, '../config'));
var pwdhash = require('password-hash');
var request = require('request');

/**
 * Profile Model
 * This models the API methods for interacting with the user profile data.
 */
var ProfileModel = {
    apiRequest: request,
    /**
     * Gets the information about a user given the email address.
     * @param email - The email address associated with the profile.
     * @param callback - The method to call and pass the result set to.
     */
    get: function(email, host, port, callback) {
        var obj = this;
        var endPoint = config.endpoints.profile.replace('{{userEmail}}', email);
		endPoint = endPoint.replace(/\{HOSTPROTO\}/g, host).replace(/\{SERVICEPORT\}/g, port);
        obj.apiRequest({
            uri: endPoint,
            method: 'GET'
        }, function (err, response, bodyContent) {
            var responseData = {};
            try {
                responseData = JSON.parse(bodyContent);
            } catch (ex) {
                responseData = {};
            }
            callback(responseData);
        });
    },
    /**
     * Checks that the user's email and password exists in the database and that the 
     * password sent in by the user matches the password set in the database.
     * @param email - The email address of the user to authenticate.
     * @param password - The password to attempt to authenticate against.
     * @param callback - A method to be called and received the user ID (if found).
     */
    authenticate: function (email, host, port, password, callback) {
        var obj = this;
        var user = undefined;
        var endPoint = config.endpoints.profile.replace('{{userEmail}}', email);
        endPoint = endPoint.replace(/\{HOSTPROTO\}/g, host).replace(/\{SERVICEPORT\}/g, port);
        obj.apiRequest({
            uri: endPoint,
            method: 'GET'
        }, function (err, response, bodyContent) {
            var responseData = {};
            try {
                responseData = JSON.parse(bodyContent);
            } catch (ex) {
                responseData = {};
            }
            if (responseData.email === email && responseData.password === pwdhash.generate(password)) {
                user = responseData;
            }
            callback(user);
        });
    },
    /**
     * Gets the information about a user given the email address.
     * @param email - The email address associated with the profile.
     * @param callback - The method to call and pass the result set to.
     */
    create: function(profileObject, host, port, callback) {
        var obj = this, password;
		var endPoint = config.endpoints.profile.replace('/profile', '').replace('{{userEmail}}', profile.Object.email);
        endPoint = endPoint.replace(/\{HOSTPROTO\}/g, host).replace(/\{SERVICEPORT\}/g, port);
        if (pwdhash.isHashed(profileObject.password)) {
            password = profileObject.password;
        } else {
            password = pwdhash.generate(profileObject.password);
        }
        
        obj.apiRequest({
            uri: endPoint,
            method: 'PUT',
            form: 'email=' + profileObject.email.trim() + '&password=' + password 
                + '&firstname=' + profileObject.firstname.trim() + '&lastname=' + profileObject.lastname.trim() 
                + '&addresses=' + JSON.stringify(profileObject.addresses) + '&preferences=' + JSON.stringify(profileObject.preferences)
        }, function (err, response, bodyContent) {
            var success = true;
            if (err) {
                success = false;
            }
            callback(success);
        });
    },
    /**
     * Update a profile for a given email address. Functions similarly to the create method.
     * @param email - The email of the profile to update
     * @param profileObject - The object containing the profile data to update.
     * @param callback - The method that is called and given data to return.
     */
    update: function (email, host, port, profileObject, callback) {
        var obj = this, password;
        var endPoint = config.endpoints.profile.replace('/profile', '').replace('{{userEmail}}', email);
        endPoint = endPoint.replace(/\{HOSTPROTO\}/g, host).replace(/\{SERVICEPORT\}/g, port);
        if (pwdhash.isHashed(profileObject.password)) {
            password = profileObject.password;
        } else {
            password = pwdhash.generate(profileObject.password);
        }
        
        obj.apiRequest({
            uri: endPoint,
            method: 'PATCH',
            form: 'email=' + email.trim() + '&password=' + password 
                + '&firstname=' + profileObject.firstname.trim() + '&lastname=' + profileObject.lastname.trim() 
                + '&addresses=' + JSON.stringify(profileObject.addresses) + '&preferences=' + JSON.stringify(profileObject.preferences)
        }, function (err, response, bodyContent) {
            var success = true;
            if (err) {
                success = false;
            }
            callback(success);
        });  
    },    
    /**
     * Deletes a user given a that user's email address
     * @param email - The email address associated with the profile to delete.
     * @param callback - The method to call and pass the result set to.
     */
    delete: function(email, host, port, callback) {
        var obj = this;
        var endPoint = config.endpoints.profile.replace('{{userEmail}}', email);
        endPoint = endPoint.replace(/\{HOSTPROTO\}/g, host).replace(/\{SERVICEPORT\}/g, port);
        obj.apiRequest({
            uri: endPoint,
            method: 'DELETE',
            form: 'email=' + email.trim()
        }, function (err, response, bodyContent) {
            var success = true;
            if (err) {
                success = false;
            }
            callback(success);
        });
    },
    /**
     * Gets order for a given user.
     * @param userId - The users ID.
     * @param callback - The method to call and pass the result set to.
     */
    getOrders: function(userId, host, port, callback) {
        var obj = this;
        var endPoint = config.endpoints.order + '/users/' + userId + '/orders';
        endPoint = endPoint.replace(/\{HOSTPROTO\}/g, host).replace(/\{SERVICEPORT\}/g, port);
        
        obj.apiRequest({
            uri: endPoint,
            method: 'GET'
        }, function (err, response, bodyContent) {
            var responseData = {};
            try {
                responseData = JSON.parse(bodyContent);
            } catch (ex) {
                responseData = {};
            }
            callback(responseData);
        });
    }
};

module.exports = ProfileModel;