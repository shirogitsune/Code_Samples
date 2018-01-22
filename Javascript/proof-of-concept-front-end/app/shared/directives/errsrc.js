/*globals angular:false, confirm:false, alert:false, document:false, app:false */
'use strict';

/**
 * Directive for handling image load errors.
 */
angular.module('singlepage').directive('errSrc', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('error', function() {
                if (attrs.src != attrs.errSrc) {
                    attrs.$set('src', attrs.errSrc);
                    attrs.$set('class', 'broken-image');
                    attrs.$set('err-src', undefined);
                }
            });
        }
    };
});