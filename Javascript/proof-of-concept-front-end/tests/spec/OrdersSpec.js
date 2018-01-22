/*globals describe:false, it:false, beforeEach:false, afterEach:false, spyOn:false, expect:false, inject:false,addedMessage:true, errMessage:true*/
'use strict';
describe('Order Controller Tests', function() {
    describe('The Order Controller', function() {
        var $controller, $httpBackend, testCart, testProfile;
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
            getElementById: function(id) {
                if (id === 'userId') {
                    return {
                        value: 'userId'
                    };
                } else if (id === 'userEmail') {
                    return {
                        value: 'sample@footlocker.com'
                    };
                }
            }
        }];
        //Mockup of cartToCheckout Service provider
        var $cartToCheckout = {
            getCart: function() {
                return testCart;
            }
        };
        
        //Set up the application and install the mock providers to the application
        beforeEach(function() {
            module('singlepage', function($provide) {
                $provide.value('$window', $windowMock);
                $provide.value('$document', $documentMock);
                $provide.value('cartToCheckout', $cartToCheckout);
            });
        });
        
        //Inject the controller
        beforeEach(inject(function (_$controller_) {
            $controller = _$controller_;
        }));    
        
        // Setup mock data
        beforeEach(function() {
            //Mockup of the cart data
            testCart = {
                cart_id: 'cartId',
                items: [
                    {
                        linenumber: 1,
                        name: 'A',
                        quantity: 1,
                        price: 100.00
                    },
                    {
                        linenumber: 2,
                        name: 'B',
                        quantity: 1,
                        price: 100.00
                    },
                    {
                        linenumber: 3,
                        name: 'C',
                        quantity: 1,
                        price: 100.00
                    }
                ],
                subtotal: 300.00
            };
            testProfile = {
                addresses: [
                    {
                        type: 'billing'
                    },
                    {
                        type: 'shipping'
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
         * Test getting order for a given user
         */
        it('should get a list of orders for a user.', function() {
            var $scope = {};
            
            $controller('OrderController', {$scope: $scope}, {$http: $httpBackend});

            $httpBackend.expectGET(/\/users\/userId\/orders$/).respond(200, [{}, {}, {}]);
            
            $scope.getOrders();
            
            $httpBackend.flush();            
            
            expect($scope.orderslist.orders).toBeDefined();
            expect($scope.orderslist.orders.length).toBe(3);
        });
        
        /**
         * Test getting data for the checkout page.
         */
        it('should fetch the data needed to populate the checkout page.', function() {
            var $scope = {};

            $controller('OrderController', {$scope: $scope}, {$http: $httpBackend});

            $httpBackend.expectGET(/\/users\/sample@footlocker.com\/profile$/).respond(200, testProfile);            
            
            $scope.doCheckout();
            
            $httpBackend.flush();     
            
            expect($scope.currentOrder.items).toBeDefined();
            expect($scope.currentOrder.billingaddress).toBeDefined();
            expect($scope.currentOrder.shippingaddress).toBeDefined();
            expect($scope.currentOrder.subtotal).toBeDefined();
            expect($scope.currentOrder.shipmethod).toBeDefined();
            expect($scope.currentOrder.shipping).toBeDefined();
            expect($scope.currentOrder.tax).toBeDefined();
            expect($scope.currentOrder.total).toBeDefined();
        });
        
        /**
         * Test placing an order (happy path)
         */
        it('should submit the data needed for placing an order.', function() {
            var $scope = {
                userId: 'userId',
				userEmail: 'userEmail',
                currentOrder:{key: 'value'}
            };

            $controller('OrderController', {$scope: $scope}, {$http: $httpBackend});

            $httpBackend.expectPOST(/\/users\/userId\/orders$/).respond(200, 'orderId');            
            
            $scope.placeOrder();
            
            $httpBackend.flush();
            
            expect($windowMock.location.hash).toBe('#/orders');
        });
        
        /**
         * Test placing an order (server replies 'OK' but doesn't return info)
         */
        it('should redirect to the cart page if the API doesn\'t return an order ID.', function() {
            var $scope = {
                userId: 'userId',
				userEmail: 'userEmail',
                currentOrder:{key: 'value'}
            };

            $controller('OrderController', {$scope: $scope}, {$http: $httpBackend});

            $httpBackend.expectPOST(/\/users\/userId\/orders$/).respond(200);            
            
            $scope.placeOrder();
            
            $httpBackend.flush();
            
            expect($windowMock.location.hash).toBe('#/cart');
        });
        
        /**
         * Test placing an order (server replies with an error)
         */
        it('should redirect to the cart page if there is a failure.', function() {
            var $scope = {
                userId: 'userId',
				userEmail: 'userEmail',
                currentOrder:{key: 'value'}
            };

            $controller('OrderController', {$scope: $scope}, {$http: $httpBackend});

            $httpBackend.expectPOST(/\/users\/userId\/orders$/).respond(503, 'Error!');            
            
            $scope.placeOrder();
            
            $httpBackend.flush();
            
            expect($windowMock.location.hash).toBe('#/cart');
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