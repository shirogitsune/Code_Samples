/*globals angular:false, confirm:false, alert:false, document:false, window:false, $filter:false */
'use strict';

var app = angular.module('singlepage', ['ngRoute']);

/**
 * Setup routing for the application.
 */
angular.module('singlepage').config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            title: 'Home',
            templateUrl: 'app/shared/home.html'
        }).when( '/login', {
            title: 'Login',
            templateUrl: 'app/components/login/login.html'
            //controller: 'LoginController',
            //controllerAs: 'auth'   
        }).when('/search/:keyword', {
            title: 'Search',
            templateUrl: 'app/components/search/searchresults.html',
            controller: 'SearchController',
            controllerAs: 'searcher'
        }).when('/product/:productid', {
            title: 'Product Detail: ',
            templateUrl: 'app/components/pdp/productdetail.html',
            controller: 'PdpController',
            controllerAs: 'pdp'
        }).when('/cart', {
            title:'Shopping Cart',
            templateUrl: 'app/components/cart/cartitems.html',
            controller: 'CartController',
            controllerAs: 'cart'
        }).when('/orders', {
            title:'My Orders',
            templateUrl: 'app/components/orders/orders.html',
            controller: 'OrderController',
            controllerAs: 'order'
        }).when('/checkout', {
            title: 'Checkout',
            templateUrl: 'app/components/orders/checkout.html',
            controller: 'OrderController',
            controllerAs: 'order'
        }).when('/wishlists',{
            title:'My Wishlists',
            templateUrl: 'app/components/wishlist/wishlists.html',
            controller: 'WishlistController',
            controllerAs: 'wishlist'
        }).when('/wishlist/:wishlistId/:wishlistName',{
            title:'Wishlist: ',
            templateUrl: 'app/components/wishlist/wishlist.html',
            controller: 'WishlistController',
            controllerAs: 'wishlist'
        }).when('/profile', {
            title: 'My Profile',
            templateUrl: 'app/components/profile/profile.html',
            controller: 'ProfileController',
            controllerAs: 'profile'
        }).otherwise({ //Display the 404 page.
            title: '404 Not Found',
            templateUrl: 'app/shared/404.html'
            /* A controller could be attached for making dynamic 404 pages */
        }); 
});

/**
 * Application 'main' method, used for setting up various global properties and
 * events.
 */
angular.module('singlepage').run(['$rootScope', function($rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        //Update the document title with the one specified in the route.
        $rootScope.title = current.$$route.title;
    });  
}]);

/**
 * Service for passing the cart between the cart and checkout controllers.
 */
angular.module('singlepage').service('cartToCheckout', function() {
    var cart = undefined;
    return {
        getCart: function () {
            return cart;
        },
        setCart: function(value) {
            cart = value;
        },
        clearCart: function(){
            cart = undefined;
        }
    };
});

/**
 * Filter to escape text by URL Encode
 */
angular.module('singlepage').filter('urlencode', function() {
    return window.encodeURIComponent;
});

/**
 * Filter for display of 'Free' shipping
 */
angular.module('singlepage').filter('shipping', ['$filter', function($filter) {
    return function(input, symbol, fractionsize) {
        if (Math.round(parseFloat(input)*100)/100 === 0.00) {
            return 'Free';
        } else {
            return $filter('currency')(input, symbol, fractionsize);
        }
    };
}]);