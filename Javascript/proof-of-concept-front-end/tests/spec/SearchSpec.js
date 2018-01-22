/*globals describe:false, it:false, beforeEach:false, afterEach:false, spyOn:false, expect:false, inject:false*/
'use strict';
describe('Search Controller Tests', function() {
    describe('The Search Controller', function() {
        var $controller, $httpBackend, $routeParams, $checkout;
        
        //Mockup of the window object
        var $windowMock = {
            alert: function(message) {
                return message;
            },
            location: {
                hash:''
            }
        };
        
        //Mockup of the window document
        var $documentMock = [{
            title: '',
            getElementById: function(id) {
                return {
                    value: 'shoes'
                };
            }
        }];
        
        //Set up the application and install the mock providers to the application
        beforeEach(function() {
            module('singlepage', function($provide) {
                $provide.value('$route', null); //Don't need the route here.
                $provide.value('$routeParams', {keyword: 'shoes'}); //Mock routeParams
                $provide.value('$document', $documentMock);
                $provide.value('$window', $windowMock);
            });
        });
        
        //Inject the controller
        beforeEach(inject(function (_$controller_) {
            $controller = _$controller_;
        }));    
        
        // Setup mock data
        beforeEach(function() {
            //Mock location hash
            $windowMock.location.hash = '';
        });
        
        // Setup Mock HTTP request object
        beforeEach(inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend'); 
        }));
        
        /**
         * TESTS
         */
        
        /**
         * Test that the search controller supports keywords pased via the
         * routeParams object.
         */
        it('should accept a keyword passed in through the route parameters', function() {
            var $scope = {};
            
            $controller('SearchController', {$scope: $scope}, 
                                            {$http: $httpBackend});
            $httpBackend.expectGET(/\/products\/search\/shoes$/)
                        .respond(200, {
                            response:{
                                docs:[{}, {}, {}]
                            }
                        });

            $scope.search();
            
            $httpBackend.flush();
            
            expect($scope.keyword).toBe('shoes');
            expect($scope.products.length).toBe(3);
            expect($documentMock[0].title).toContain('shoes');
        });
        
        /**
         * Perform after test cleanup.
         */
        afterEach(function() {
            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();
        });
    });
});