/*globals angular:false, confirm:false, alert:false, document:false, app:false, $window:false */
'use strict';

/**
 * Controller for the user login.
 */
angular.module('singlepage').controller('LoginController', ['$scope', '$http', '$document', '$window', 'endpoints',
function ($scope, $http, $document, $window, endpoints) {
    $scope.errorMessage = '';
    
    $scope.doLogin = function () {
        
    };
}]);