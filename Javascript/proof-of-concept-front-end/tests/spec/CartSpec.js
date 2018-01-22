/*globals describe:false, it:false, beforeEach:false, afterEach:false, spyOn:false, expect:false, inject:false,addedMessage:true, errMessage:true*/
'use strict';
describe('Cart Controller Tests', function() {
    describe('The Cart Controller', function() {
        var $controller, $httpBackend, testCart, $checkout;
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
            getElementById: function(id) {
                return {
                    value: 'userId'
                };
            }
        }];
        //Mockup of cartToCheckout Service provider
        var $cartToCheckout = {
            cart: undefined,
            setCart: function(value) {
                this.cart = value;
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
         * Test fetching a cart from the mock API and that the 
         * data gets put into the correct buckets.
         */    
        it('should get a cart for a given user.', function() {
            var $scope = {};
            
            $controller('CartController', {$scope: $scope}, {$http: $httpBackend});

            $httpBackend.expectGET(/\/users\/userId\/carts$/).respond(200, [{'cart_id': 'cartId'}]);
            $httpBackend.expectGET(/\/users\/userId\/carts\/cartId$/).respond(200, [testCart]);
            
            var alertFired = $scope.getCart();
            
            $httpBackend.flush();
            
            expect(alertFired).not.toBeDefined();
            expect($scope.cartId).toBeDefined();
            expect($scope.cart.items.length).toBe(3);
            expect($scope.cart.subtotal).toBe(300.00);
        });
        
        /**
         * Test that removal of items functions correctly.
         */
        it('should remove an item from a cart.', function() {
            //Set base scope state.
            var $scope = {
                cartId: 'cartId',
                userId: 'userId',
                cart: {
                    items: testCart.items,
                    subtotal: testCart.subtotal
                }
            };
            
            $controller('CartController', {$scope: $scope}, {$http: $httpBackend});            
            
            $httpBackend.expectPUT(/\/users\/userId\/carts\/cartId$/).respond(200, [testCart]);
            
            var alertFired = $scope.removeItem(3);
            
            $httpBackend.flush();
            
            expect($windowMock.location.hash).toBe('#/cart');
            expect($scope.cart.items.length).toBe(2);
            expect($scope.cart.subtotal).toBe(200.00);
        });
        
        /**
         * Test that the checkout method forward the user to the checkout.
         */
        it('should send the user to checkout.', function() {
            var $scope = {
                cartId: 'cartId',
                userId: 'userId',
                cart: {
                    items: testCart.items,
                    subtotal: testCart.subtotal
                }
            };
            
            $controller('CartController', {$scope: $scope}, {$http: $httpBackend});
            
            $scope.checkout();        
            
            expect($cartToCheckout.cart).toBeDefined();
            expect($windowMock.location.hash).toBe('#/checkout');
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