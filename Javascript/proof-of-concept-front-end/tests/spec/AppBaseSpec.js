/*globals describe:false, it:false, beforeEach:false, afterEach:false, spyOn:false, expect:false, inject:false,addedMessage:true, errMessage:true*/
'use strict';

describe('Base Application Tests', function() {
    beforeEach(module('singlepage'));
    
    /**
     * Test the configuration of the endpoints 'constant'
     */
    describe('The Endpoint Configuration', function() {
        it('Should have 6 endpoints', inject(function(endpoints) {
            expect(Object.keys(endpoints).length).toBe(6); 
        }));
        
        it('should have a products endpoint.', inject(function(endpoints) {
            expect(Object.keys(endpoints)).toContain('products'); 
        }));
        
        it('should have a search endpoint.', inject(function(endpoints) {
            expect(Object.keys(endpoints)).toContain('search'); 
        }));
        
        it('should have a cart endpoint.', inject(function(endpoints) {
            expect(Object.keys(endpoints)).toContain('cart'); 
        }));
        
        it('should have an order endpoint.', inject(function(endpoints) {
            expect(Object.keys(endpoints)).toContain('order'); 
        }));
        
        it('should have a wishlist endpoint.', inject(function(endpoints) {
            expect(Object.keys(endpoints)).toContain('wishlist'); 
        }));
        
        it('should have a profile endpoint.', inject(function(endpoints) {
            expect(Object.keys(endpoints)).toContain('profile'); 
        }));
        
        it('should have values for each endpoint.', inject(function(endpoints) {
            for (var e in endpoints) {
                expect(endpoints[e]).toBeDefined();
                expect(endpoints[e]).not.toBe('');
            } 
        }));
    });
    
    /**
     * Test the configuration of the application router.
     */
    describe('The Route configuration', function() {
        it('should have routes.', inject(function($route) {
            expect($route.routes).toBeDefined();
            expect(Object.keys($route.routes).length).toBeGreaterThan(0);
        }));
        
        it('should have 11 routes with titles.', inject(function($route) {
            var count = 0;
            for (var r in $route.routes) {
                if ($route.routes[r].hasOwnProperty('title')) {
                    count++;
                } 
            }
            expect(count).toBe(11);
        }));
        
        it('should have 10 routes that redirect to the originals.', inject(function($route) {
            var count = 0;
            for (var r in $route.routes) {
                if ($route.routes[r].hasOwnProperty('redirectTo')) {
                    count++;
                } 
            }
            expect(count).toBe(10);
        }));
        
        it('should have a 404 catch all route.', inject(function($route) {
            var catchAlls = [];
            for (var r in $route.routes) {
                if (r === 'null') {
                    catchAlls.push($route.routes[r]);
                } 
            }
            expect(catchAlls.length).toBe(1);
            expect(catchAlls[0].templateUrl).toContain('404.html');
        }));
    });
    
    /**
     * Test the service to pass the cart information from shopping cart to checkout without
     * having to make an additional HTTP call.
     */
    describe('The Cart To Checkout Service', function() {
        it('should have setters and getters.', inject(function(cartToCheckout) {
            expect(cartToCheckout.hasOwnProperty('setCart')).toBe(true);
            expect(cartToCheckout.hasOwnProperty('getCart')).toBe(true);
            cartToCheckout.setCart({});
            expect(cartToCheckout.getCart()).toBeDefined();
        }));
        
        it('should have a clear method.', inject(function(cartToCheckout) {
            expect(cartToCheckout.hasOwnProperty('clearCart')).toBe(true);
            cartToCheckout.setCart({});
            cartToCheckout.clearCart();
            expect(cartToCheckout.getCart()).not.toBeDefined();
        }));
    });
    
    /**
     * Test the urlencode filter (which is a wrapper for window.encodeURIComponent)
     */
    describe('The \'urlencode\' filter', function() {
        var $filter;
        var testString = 'The fox = (quick, brown) jumped over the dog = (lazy)';
            
        beforeEach(inject(function(_$filter_){
            $filter = _$filter_;
        }));
        
        it('should perform URL encoding on a string.', function() {
            var urlEncode = $filter('urlencode');
            expect(urlEncode(testString)).toBe(window.encodeURIComponent(testString));
        });
    });
    
    /**
     * Test the shipping price filter.
     */
    describe('The \'shipping\' filter for prices', function() {
        var $filter;
            
        beforeEach(inject(function(_$filter_){
            $filter = _$filter_;
        }));
        
        it('should return \'Free\' on 0.00 dollar amounts.', function(){
            var shipPriceFilter = $filter('shipping');
            expect(shipPriceFilter(0.00)).toBe('Free'); 
        });
        
        it('should return \'$10.00\' on when given 10.00 (default of USD).', function(){
            var shipPriceFilter = $filter('shipping');
            expect(shipPriceFilter(10.00)).toBe('$10.00'); 
        });
        
        it('should allow for different currency symbols (£, for example).', function(){
            var shipPriceFilter = $filter('shipping');
            expect(shipPriceFilter(10.00, '£')).toContain('£'); 
            expect(shipPriceFilter(10.00, '£')).toBe('£10.00');
        });
        
        it('should allow for custom number of decimal places.', function(){
            var shipPriceFilter = $filter('shipping');
            expect(shipPriceFilter(10.00, '$', 3)).toBe('$10.000'); 
        });
    });
    
    /**
     * Test the err-src directive (for handling broken images)
     */
    describe('The err-src directive', function() {
        var $compile, $rootScope;
        var knownGood = 'lib/jasmine-2.4.1/jasmine_favicon.png';
        var knownBad = 'lib/jasmine-2.4.1/' + Date.now() + '.png';
        var testHTML = '<img src="{{img}}" err-src="{{errImg}}" />';
        
        beforeEach(inject(function(_$compile_, _$rootScope_) {
            $compile = _$compile_;
            $rootScope = _$rootScope_;
        }));
        
        it('should not interfere with normal image loading.', function() {
            var testBed = $compile(testHTML.replace('{{img}}', knownGood).replace('{{errImg}}', knownBad))($rootScope);
            $rootScope.$digest();
            expect(testBed.attr('src')).toBe(knownGood);
            expect(testBed.attr('err-src')).toBeDefined();           
            expect(testBed.hasClass('broken-image')).toBe(false);
        });
        
        it('should change the src attr to use the err-src attribute and clean up.', function(done) {
            var testBed = $compile(testHTML.replace('{{img}}', knownBad).replace('{{errImg}}', knownGood))($rootScope);
            $rootScope.$digest();
            testBed.on('load', function() {
                expect(testBed.attr('src')).toBe(knownGood);
                expect(testBed.attr('err-src')).not.toBeDefined();           
                expect(testBed.hasClass('broken-image')).toBe(true);
                done();
            });
        });
    });
    
    /**
     * Test the Search Form Directive
     */
    describe('The Search Form Directive', function() {
        var $compile, $rootScope, $windowObj;
        
        var testHTML = '<form search-form><input value="keyword" /><button type="submit">Search</button></form>';
        
        beforeEach(function() {
            $windowObj = {location: {hash:''}};
            module(function($provide) {
                $provide.value('$window', $windowObj);   
            });
        });
        
        beforeEach(inject(function(_$compile_, _$rootScope_) {
            $compile = _$compile_;
            $rootScope = _$rootScope_;
        }));
        
        it('should update the window hash to be \'/search/\' followed by the value of the form\'s input.', function(done) {
            var testBed = $compile(testHTML)($rootScope);
            $rootScope.$digest();
            testBed.on('submit', function(){
                expect($windowObj.location.hash).toBe('/search/keyword');
                done();    
            });
            testBed.triggerHandler('submit');
                       
        });
    });
}); //End Base Application Tests