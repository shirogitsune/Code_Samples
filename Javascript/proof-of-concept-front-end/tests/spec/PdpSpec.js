/*globals describe:false, it:false, beforeEach:false, 
  afterEach:false, spyOn:false, expect:false, inject:false, 
  angular: false;*/
'use strict';

describe('PDP Controller Tests', function() {
    describe('The PDP Controller', function() {
        var $controller, $httpBackend, testItem, routeParams;
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
                if (id === 'userId') {
                    return {
                        value: 'userId'
                    };
                }
            }
        }];
        
        // Setup mock data
        beforeEach(function() {
            //Mockup of the product data
            testItem = {
                name: 'Test Shoe',
                description: 'It is a test shoe!',
                product_id: '8675301',
                size: '',
                listprice: 100.00,
                saleprice: 100.00,
                quantity: 1
            };
            //Mock location hash
            $windowMock.location.hash = '';
        });
        
        //Set up the application and install the mock providers to the application
        beforeEach(function() {
            module('singlepage', function($provide) {
                $provide.value('$window', $windowMock);
                $provide.value('$document', $documentMock);
                $provide.value('$routeParams', {productid: '8675301'}); //Mock routeParams
            });
        });
        
        //Inject the controller
        beforeEach(inject(function (_$controller_) {
            $controller = _$controller_;
        })); 
       
        // Setup Mock HTTP request object
        beforeEach(inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend'); 
        }));
        
        /**
         * TESTS
         */ 
        
        /**
         * Tests getting the product information.
         */
        it('should get product information for a given product.', function() {
            var $scope = {};
            
            $controller('PdpController', {$scope: $scope}, {$http: $httpBackend});
            
            $httpBackend.expectGET(/\/products\/8675301$/).respond(200, [testItem]);

            $scope.getProduct();
            
            $httpBackend.flush();
            
            expect($scope.product).toBeDefined();
            expect($scope.lineitem).toBeDefined();
            expect($scope.product).toEqual(testItem);
            expect($documentMock[0].title).toContain(testItem.name);
            
        });
        
        /**
         * Tests the method for converting product data to cart line item objects.
         */
        it('should setup and return the product as a cart line item with certain fields set to a default value.', function() {
            var $scope = {};
            
            $controller('PdpController', {$scope: $scope}, {$http: $httpBackend});

            var lineitem = $scope.setLineItem(testItem);
            
            expect(lineitem).toBeDefined();
            expect(lineitem.productname).toBe(testItem.name);
            expect(lineitem.productdescription).toBe(testItem.description);
            expect(lineitem.product_id).toBe(testItem.product_id);
            expect(lineitem.size).toBe('');
            expect(lineitem.price).toBe(testItem.listprice);
            expect(lineitem.quantity).toBe(1);
        });
        
        /**
         * Test the "Add To Cart" method.
         */
        it('should allow the product to be added to the cart.', function() {
            var $scope = {
                lineitem: {
                    productname: 'Test Product',
                    productdescription: 'Test Description',
                    product_id: '1',
                    size: 'L',
                    price: 100.00,
                    quantity: 1
                }
            };
            
            $controller('PdpController', {$scope: $scope}, {$http: $httpBackend});
            
            $httpBackend.expectGET(/\/users\/userId\/carts$/).respond(200, [{cart_id: 'cartId'}]);
            $httpBackend.expectGET(/\/users\/userId\/carts\/cartId$/).respond(200, [{}]);
            $httpBackend.expectPUT(/\/users\/userId\/carts\/cartId$/).respond(200, 'OK');
            
            $scope.addToCart();
            
            $httpBackend.flush();
            
            expect($scope.addedMessage).toBeDefined();
            expect($scope.addedMessage).not.toBe('');
        });
        
        /**
         * Tests that the check for a selected size functions.
         */
        it('should require the product have a size selected.', function() {
            var success;
            var $scope = {
                lineitem: {
                    productname: 'Test Product',
                    productdescription: 'Test Description',
                    product_id: '1',
                    size: '',
                    price: 100.00,
                    quantity: 1
                }
            };
            
            $controller('PdpController', {$scope: $scope}, {$http: $httpBackend});
            
            success = $scope.addToCart();
            
            expect($scope.message).not.toBe('');
            expect(success).toBe(false);
        });
        
        /**
         * Tests that the check for quantity less than 1 functions.
         */
        it('should require the product quantity be 1 or more', function() {
            var success;
            var $scope = {
                lineitem: {
                    productname: 'Test Product',
                    productdescription: 'Test Description',
                    product_id: '1',
                    size: 'L',
                    price: 100.00,
                    quantity: 0
                }
            };
            
            $controller('PdpController', {$scope: $scope}, {$http: $httpBackend});
            
            success = $scope.addToCart();
            
            expect($scope.message).not.toBe('');
            expect(success).toBe(false);
        });
        
        /**
         * Test the check for quantity over 255 functions.
         */
        it('should require the product quantity be 255 or less', function() {
            var success;
            var $scope = {
                lineitem: {
                    productname: 'Test Product',
                    productdescription: 'Test Description',
                    product_id: '1',
                    size: 'L',
                    price: 100.00,
                    quantity: 9001
                }
            };
            
            $controller('PdpController', {$scope: $scope}, {$http: $httpBackend});
            
            success = $scope.addToCart();
            
            expect($scope.message).not.toBe('');
            expect(success).toBe(false);
        });
        
        /**
         * Test the function of the isOnSale method test functions.
         */
        it('should provide a facility for determining if a product is on sale for proper messaging.', function() {
            var $scope = {};
            
            $controller('PdpController', {$scope: $scope}, {$http: $httpBackend});
            
            expect($scope.isOnSale(100.00, 100.00)).toBe(false);
            expect($scope.isOnSale(100.00, 50.00)).toBe(false);
            expect($scope.isOnSale(50.00, 100.00)).toBe(true);
        });
        
        /**
         * Tests that messages can be passed to the scope.
         */
        it('should provide a method for setting a message to display in the current scope.', function() {
            var $scope = {};
            var testMessage = 'This is a test message.';
            
            $controller('PdpController', {$scope: $scope}, {$http: $httpBackend});
            
            $scope.setMessage(testMessage);
            
            expect($scope.message).toBe(testMessage);
        });

        /**
         * Test that the method for toggling the "Add To Wishlist" dialog flips the boolean correctly.
         */
        it('should provide a utility for togging the "Add to Wishlist" dialog.', function() {
            var $scope = {};
            var testMessage = 'This is a test message.';
            
            $controller('PdpController', {$scope: $scope}, {$http: $httpBackend});
            
            expect($scope.addtowishlist).toBe(false)
            
            $scope.addToWishList();
            
            expect($scope.addtowishlist).toBe(true);
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