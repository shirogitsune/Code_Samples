/*globals describe:false, it:false, beforeEach:false, afterEach:false, spyOn:false, expect:false, inject:false, angular:false*/
'use strict';
describe('Wishlist Controller Tests', function() {
    describe('The Wishlist Controller', function() {
        var $controller, $httpBackend, $routeParams, testWishlist;
        
        //Mockup of the window object
        var $windowMock = {
            alert: function(message) {
                return message;
            },
            confirm: function(message) {
                return true;  
            },
            location: {
                hash:''
            }
        };
        
        //Mockup of the window document
        var $documentMock = [{
            title: '',
            getElementById: function(id) {
                if (id === 'userId'){ 
                    return {
                        value: 'userId'
                    };
                } else if (id === 'wishlists') {
                    return {
                        value: 'wishlistId'
                    };
                } else if (id === 'delete') {
                    return {
                        value: 'wishlistId'
                    };
                } else if (id === 'wishlistName') {
                    return {
                        value: 'Test List'
                    };
                }
            }
        }];
        
        //Set up the application and install the mock providers to the application
        beforeEach(function() {
            module('singlepage', function($provide) {
                $provide.value('$route', null); //Don't need the route here.
                $provide.value('$routeParams', {
                    wishlistName: 'Test%20List',
                    wishlistId: 'wishlistId'
                }); //Mock routeParams
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
            testWishlist = {
                wishlist_id: 'wishlistId',
                creation_date: '2016-02-02 23:59:59+0000',
                user_id: 'userId',
                items: [
                    {
                        linenumber: 1,
                        productname: 'A',
                        productdescription: '',
                        product_id: '1',
                        size: '09.0',
                        price: 100.00,
                        quantity: 1
                    },
                    {
                        linenumber: 2,
                        productname: 'B',
                        productdescription: '',
                        product_id: '2',
                        size: '10.0',
                        price: 100.00,
                        quantity: 1
                    },
                    {
                        linenumber: 3,
                        productname: 'C',
                        productdescription: '',
                        product_id: '3',
                        size: '11.0',
                        price: 100.00,
                        quantity: 1
                    }      
                ]
            };
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
         * Test getting wishlists for a user.
         */
        it('should get a list of wishlists for a given user.', function() {
            var $scope = {};
            
            $controller('WishlistController', {$scope: $scope}, {$http: $httpBackend});
            
            $httpBackend.expectGET(/\/users\/userId\/wishlists$/).respond(200, [{},{},{}]);
            
            $scope.getWishLists();
            
            $httpBackend.flush();
            
            expect($scope.wishlists).toBeDefined();
            expect($scope.wishlists.length).toBe(3);
        });
        
        /**
         * Test getting items for a given wishlist.
         */
        it('should get the items for a given wishlist.', function() {
            var $scope = {};
            
            $controller('WishlistController', {$scope: $scope}, {$http: $httpBackend});
            
            $httpBackend.expectGET(/\/users\/userId\/wishlists\/wishlistId$/).respond(200, [testWishlist]);
            
            $scope.getWishlistItems();
            
            $httpBackend.flush();
            
            expect($scope.wishlist).toBeDefined();
            expect($scope.wishlist.items).toBeDefined();
            expect($scope.wishlist.items.length).toBe(3);
            expect($scope.wishlist.name).toBeDefined();
            expect($documentMock[0].title).toContain('Test%20List');
        });
        
        /**
         * Test adding items to an existing wishlist.
         */
        it('should allow for adding items to a wishlist.', function() {
            var $scope = {
                addtowishlist: true,
                wishlist: {}
            };
            
            var testItem = {
                productname: 'D',
                productdescription: '',
                product_id: '4',
                size: '12.0',
                price: 100.00
            };
            
            angular.copy(testWishlist, $scope.wishlist);
            
            $controller('WishlistController', {$scope: $scope}, {$http: $httpBackend});
            
            $httpBackend.expectGET(/\/users\/userId\/wishlists\/wishlistId$/).respond(200, [testWishlist]);
            $httpBackend.expectPUT(/\/users\/userId\/wishlists\/wishlistId\/items$/).respond(200, 'OK');
        
            $scope.addItemToWishList(testItem);
            
            $httpBackend.flush();

            expect($scope.addtowishlist).toBe(false);
            expect($scope.wishlist.items.length).toBeGreaterThan(testWishlist.items.length);
        });
        
        /**
         * Test removing items from a wishlist.
         */
        it('should allow for removal of items from a wishlist.', function() {
            var $scope = {
                wishlist: {}
            };
            
            angular.copy(testWishlist, $scope.wishlist);
            
            $controller('WishlistController', {$scope: $scope}, {$http: $httpBackend});
            
            $httpBackend.expectPUT(/\/users\/userId\/wishlists\/wishlistId\/items$/).respond(200, {status:'OK'});
            
            $scope.removeItemFromWishlist(1);
            
            $httpBackend.flush();
            
            expect($scope.wishlist.items.length).toBeLessThan(testWishlist.items.length);
        });
        
        /**
         * Test creating new wishlists.
         */
        it('should allow for creation of new wishlists.', function() {
            var $scope = {};
            
            $controller('WishlistController', {$scope: $scope}, {$http: $httpBackend});
            
            $httpBackend.expectPOST(/\/users\/userId\/wishlists$/, 
                                    {user_id: 'userId', name: 'Test List', items: []}).respond(200, {status:'OK'});
            
            $scope.createWishlist();
            
            $httpBackend.flush();
            
            expect($windowMock.location.hash).toBe('#/wishlists/');
        });
        
        /**
         * Test deleting wishlists.
         */
        it('should allow for deletion of existing wishlists.', function() {
            var $scope = {};
            
            $controller('WishlistController', {$scope: $scope}, {$http: $httpBackend});
            
            $httpBackend.expectDELETE(/\/users\/userId\/wishlists\/wishlistId$/).respond(200, {status:'OK'});
            
            $scope.deleteWishlist();
            
            $httpBackend.flush();
            
            expect($windowMock.location.hash).toBe('#/wishlists');            
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