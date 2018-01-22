/*globals angular:false, confirm:false, alert:false, document:false, app:false, $window:false */
'use strict';

/**
 * Directive for handling search form.
 */
angular.module('singlepage').directive('searchForm', ['$window', function($window) {
    return {
        restrict: 'AC',
        link: function(scope, element, attrs) {
            element.bind('submit', function() {
                if(element.find('input').val() !== '') {
                    $window.location.hash = '/search/' + element.find('input').val();
                }
            });
        }
    };
}]);