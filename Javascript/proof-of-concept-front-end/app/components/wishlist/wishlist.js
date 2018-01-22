/*globals angular:false, confirm:false, alert:false, document:false, app:false, $window:false */
'use strict';

/**
 * Controller for the wishlists page.
 */
angular.module('singlepage').controller('WishlistController', ['$scope', '$http', '$routeParams', '$document', '$window', 'endpoints',
function ($scope, $http, $routeParams, $document, $window, endpoints) {
    $scope.wishlists = $scope.wishlists || {};
    $scope.wishlist = $scope.wishlist || {};
    $scope.userId = $scope.userId || '';
    
    /**
     * Get a list of wishlists from the API.
     */
    $scope.getWishLists = function () {
        $scope.userId = $scope.getUserId();
        if ($scope.userId !== '') {
            $http.get(endpoints.wishlist.replace('{{userId}}', $scope.userId)
                                        .replace('/{{wishlistId}}', '')).then(
            function successCallback(reply) {
            
                $scope.wishlists = reply.data;

            }, 
            function errorCallback(response) { 
                
                $window.alert('Oops! It broke!');
            
            });
        }
    };
    
    /**
     * Given a specific wishlist, get the items and info for that wishlist.
     */
    $scope.getWishlistItems = function () {
        $scope.userId = $scope.getUserId();
        if ($scope.userId !== '') {
            $http.get(endpoints.wishlist.replace('{{userId}}', $scope.userId)
                                        .replace('{{wishlistId}}', $routeParams.wishlistId)).then(
            function successCallback(reply) {
                if (reply.data[0] !== undefined) {
                    
                    $scope.wishlist = reply.data[0];
                    if ($routeParams.wishlistName) {
                        $scope.wishlist.name = $routeParams.wishlistName;
                        $document[0].title += ' ' + $routeParams.wishlistName;
                    }
                    
                } else {
                    //This case covers going back in the browser to a deleted list.
                    $window.alert('Invalid wishlist! Please go back and try again.');
                    $window.location.hash = '#/wishlists';
                }
            }, 
            function errorCallback(response) { 
                
                $window.alert('Oops! It broke!');
            
            });
        } else {
            $window.alert('Please login to view your wishlist');
            $window.location.hash = '#/login';
        }
    };
    
    /**
     * Adds an item to the wishlist. Line items are a subset of products and similar to those in the cart.
     * @param {object} lineitem - The product information needed to add the item to the wishlist. Much like those in the cart.
     */
    $scope.addItemToWishList = function (lineitem) {
        $scope.userId = $scope.getUserId();
        var selectedList = $document[0].getElementById('cart_wishlists').value;
        if (lineitem.size === '' || lineitem.size === undefined) {
            $window.alert('Please select a size.');
            return false;
        }  
        if ($scope.userId !== '') {          
            $http.get(endpoints.wishlist.replace('{{userId}}', $scope.userId)
                                        .replace('{{wishlistId}}', selectedList)).then(
                function successCallback(reply){
                    var items = reply.data[0].items || [];
                    lineitem.linenumber = items.length + 1;
                    lineitem.quantity = 1;
                    items.push(lineitem);
                    $http({
                        method:'PUT',
                        url: endpoints.wishlist.replace('{{userId}}', $scope.userId)
                                            .replace('{{wishlistId}}', selectedList) + '/items',
                        responseType: 'json',
                        data: {'items':items}
                    }).then(
                        function successCallback(reply) {
                            $window.alert('Item Added to wishlist!');
                            $scope.wishlist.items = items;
                            $scope.addtowishlist = false;
                        },
                        function errorCallback(reply) {
                            $window.alert('Oops! It broke!');
                        }
                    );
                },
                function errCallback(reply) {
                    $window.alert('Oops! It broke!');
                }
            );
        } else {
            $window.alert('Please login to access your wishlists');
            $window.location.hash = '#/login';
        } 
    };
    
    /**
     * Removes a specific item from the wishlist.
     * @param {integer} The 1-based index of the item to remove from the wishlist.
     */
    $scope.removeItemFromWishlist = function(lineNumber) {
        $scope.userId = $scope.getUserId();
        //Test if we have items first.
        if ($scope.wishlist.items && $scope.wishlist.items.length > 0) {
            //Filter through the cart items array, keeping the items that are NOT the one we selected.
            $scope.wishlist.items = $scope.wishlist.items.filter(function(item){
                return item.linenumber !== lineNumber;  
            });
            //Update the line numbers and subtotal.
            for (var x = 0; x < $scope.wishlist.items.length; x++) {
                $scope.wishlist.items[x].linenumber = x + 1;
            }
            //Send the updates to the API.
            if ($scope.userId !== '') {    
                $http({
                    method: 'PUT', 
                    responseType: 'json',
                    url: endpoints.wishlist.replace('{{userId}}', $scope.userId)
                                        .replace('{{wishlistId}}', $routeParams.wishlistId) + '/items', 
                    data: {'items':$scope.wishlist.items}
                }).then(
                    function successCallback(reply) {
                        $window.alert('Item removed!');
                    },
                    function errorCallback(reply) {
                        $window.alert('Oops! It broke!');
                    }
                );
            } else {
                $window.alert('Please login to access your wishlists');
                $window.location.hash = '#/login';
            }
        }
    };
    
    /**
     * Given a specific wishlist, delete that wishlist from the database.
     */
    $scope.deleteWishlist = function() {
        $scope.userId = $scope.getUserId();
        var wishlistId = $document[0].getElementById('delete').value;
        if ($scope.userId !== '') {    
            if ($window.confirm('Are you sure you wish to delete this list and all it\'s items?')) {
                $http({
                    url: endpoints.wishlist.replace('{{userId}}', $scope.userId)
                                        .replace('{{wishlistId}}', wishlistId),
                    method: 'DELETE',
                    responseType: 'json'
                }).then(
                function successCallback(reply) {
                    
                    $window.alert('Wishlist deleted!');
                    $window.location.hash = '#/wishlists';
                    
                }, 
                function errorCallback(response) { 
                    
                    $window.alert('Oops! It broke!');
                
                });
            }
        } else {
            $window.location.hash = '#wishlists';  
        }
    };
    
    /**
     * Create a new wishlist for the given user.
     */
    $scope.createWishlist = function() {
        $scope.userId = $scope.getUserId();
        var wishlistName = $document[0].getElementById('wishlistName').value;
        if ($scope.userId !== '') {    
            if (wishlistName !== '' && wishlistName !== undefined) {
                $http({
                    method: 'POST',
                    url: endpoints.wishlist.replace('{{userId}}', $scope.userId)
                                        .replace('/{{wishlistId}}', ''),
                    data: {user_id: $scope.userId, name: wishlistName, items: []}
                }).then(
                function successCallback(reply) {
                    
                    $window.alert('Wishlist created!');
                    $window.location.hash = '#/wishlists/';
                    
                }, 
                function errorCallback(response) { 
                    
                    $window.alert('Oops! It broke!');
                
                });
            }
        } else {
            $window.alert('Please login to create a wishlist.');
            $window.location.hash = '#/login';
        }
    };
    
    $scope.getUserId = function () {
        return $document[0].getElementById('userId').value;  
    };
    
}]);