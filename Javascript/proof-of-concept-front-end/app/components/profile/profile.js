/*globals angular:false, confirm:false, alert:false, document:false, app:false, $window:false */
'use strict';

/**
 * Controller for the user profiles.
 */
angular.module('singlepage').controller('ProfileController', ['$scope', '$http', '$document', '$window', 'endpoints',
function ($scope, $http, $document, $window, endpoints) {
    $scope.userEmail = $scope.userEmail || undefined;
    $scope.editMode = $scope.editMode || false;
    $scope.userProfile = $scope.userProfile || {};
    $scope.editProfile = $scope.editProfile || {};
    
    /**
     * Get profile information for the current email address.
     */
    $scope.getProfile = function () {
        $scope.userEmail = $scope.getUserEmail();
        if ($scope.userEmail !== '') { 
            $http.get(endpoints.profile.replace('{{userEmail}}', $scope.userEmail)).then(
                function successCallback(reply) {
                    delete reply.data.password;
                    $scope.userProfile = reply.data;
                },
                function errCallback(reply) {
                    $window.alert('Oops! It broke!');
                }
            );
        } else {
            $window.location.hash = '#/login';
        }
        
    };
    
    /**
     * Save the given profile information for the provided email address.
     */
    $scope.saveProfile = function () {
        angular.copy($scope.editProfile, $scope.userProfile);
        $scope.toggleEditMode();
        if ($scope.userEmail !== '') {
            $http({
                method:'PATCH',
                responseType: 'text',
                url: endpoints.profile.replace('{{userEmail}}', $scope.userEmail).replace('/profile', ''),
                data: $scope.userProfile
            }).then(
                function successCallback(reply){
                    $window.alert('Profile updated!');
                    $window.location.hash = '#/profile';
                },
                function errCallback(reply){
                    $window.alert('Oops! It broke!');
                }
            );
        } else {
            $window.location.hash = '#/login';
        }
    };
    
    /**
     * Toggle the edit mode flag and creates a temp profile for editing.
     */
    $scope.toggleEditMode = function () {
        if (!$scope.editMode) {
            angular.copy($scope.userProfile, $scope.editProfile);
        } else {
            $scope.editProfile = {};
        }
        return $scope.editMode = !$scope.editMode;  
    };
    
    /**
     * Appends an address object to the temp profile.
     */
    $scope.addAddress = function() {
        $scope.editProfile.addresses.push({
            type: 'billing',
            name: 'New Address' + Number($scope.editProfile.addresses.length + 1),
            line1: '',
            line2: '',
            city: '',
            state: '',
            zipcode:''
        });
    };
    
    /**
     * Appends a preference item to the temp profile.
     */
    $scope.addPreference = function() {
        $scope.editProfile.preferences.push('New Preference' + Number($scope.editProfile.preferences.length + 1));
    };
    
    /**
     * Removes a preference item from the temp profile.
     * @param {integer} The 0-based index of hte preference ot remove.
     */
    $scope.removePreference = function(index) {
        $scope.editProfile.preferences.splice(index, 1);
    };
    
    /**
     * Removes an address object from the temp profile.
     * @param {integer} The 0-based index of the address to remove from the profile.
     */
    $scope.removeAddress = function(index) {
        $scope.editProfile.addresses.splice(index, 1);
    };
    
    $scope.getUserEmail = function () {
        return $document[0].getElementById('userEmail').value;  
    };
}]);