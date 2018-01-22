/*globals angular:false, confirm:false, alert:false, document:false, app:false, $window:false */
'use strict';

/**
 * Controller for the search page.
 */
angular.module('singlepage').controller('SearchController', ['$scope', '$http', '$routeParams', '$document', '$window', 'endpoints',
function ($scope, $http, $routeParams, $document, $window, endpoints) {
    $scope.keyword = $scope.keyword || $routeParams.keyword;
    $scope.products = $scope.products || {};
    
    /**
     * Perform the search request against the API.
     */
    $scope.search = function () {
        if ($document[0].getElementById('keyword') !== $scope.keyword && $scope.keyword !== undefined) {
            $document[0].getElementById('keyword').value = $scope.keyword;
        } 
        $http.get(endpoints.search.replace('{{searchTerm}}', $scope.keyword)).then(
        function successCallback(reply) {
        
            $scope.products = reply.data.response.docs;
            if ($scope.keyword) {
                $document[0].title = 'Search for: ' + $scope.keyword;
            }
        }, function errorCallback(response) { 
            
            $window.alert('Oops! It broke!');
        
        });
    };

}]);