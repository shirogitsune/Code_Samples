/*globals angular:false, confirm:false, window:false, alert:false, document:false, app:false, $window:false */
'use strict';

/**
 * Controller for the cart page.
 */
angular.module('singlepage').controller('CartController', ['$scope', '$http', '$document', '$window', 'cartToCheckout', 'endpoints', 
function ($scope, $http, $document, $window, checkoutCart, endpoints) {
    $scope.cart = $scope.cart || {};
    $scope.cartId = $scope.cartId || '';
    $scope.userId = $scope.userId || '';
    
    /**
     * Get the carts for a given user, then grab the first cart for that user.
     */
    $scope.getCart = function () {
        $scope.userId = $scope.getUserId();
        $scope.cartId = '';
        if ($scope.userId !== '') {
            $http.get(endpoints.cart.replace('{{userId}}', $scope.userId).replace('/{{cartId}}', '')).then(
                function successCallback(reply) {
                    $scope.cartId = reply.data[0].cart_id;   
                    $http.get(endpoints.cart.replace('{{userId}}', $scope.userId).replace('{{cartId}}', $scope.cartId)).then(
                        function successCallback(reply) {
                            $scope.cart.items = reply.data[0].items;
                            $scope.cart.subtotal = reply.data[0].subtotal;
                        },
                        function errorCallback(reply) {
                            $window.alert('Oops! It broke!');                             
                        }
                    );
                },
                function errorCallback(reply) {
                    $window.alert('Oops! It broke!');
                }
            );
        } else {
           $scope.cart.items = [];
           $scope.cart.subtotal = 0.00;
        }
    };
    
    /**
     * Remove an item from the cart.
     * @param {integer} lineNumber - The 1-based index of the item in the cart to remove.
     */
    $scope.removeItem = function (lineNumber) {
        //Test if we have items first.
        if ($scope.cart.items && $scope.cart.items.length > 0) {
            $scope.cart.subtotal = 0;
            //Filter through the cart items array, keeping the items that are NOT the one we selected.
            $scope.cart.items = $scope.cart.items.filter(function(item){
                return item.linenumber !== lineNumber;  
            });
            //Update the line numbers and subtotal.
            for (var x = 0; x < $scope.cart.items.length; x++) {
                $scope.cart.items[x].linenumber = x + 1;
                $scope.cart.subtotal += parseFloat($scope.cart.items[x].price) * parseInt($scope.cart.items[x].quantity);
            }
            //Send the updates to the API.
            if ($scope.userId !== '') {
                $http({
                    method: 'PUT', 
                    responseType: 'json',
                    url: endpoints.cart.replace('{{userId}}', $scope.userId).replace('{{cartId}}', $scope.cartId), 
                    data: {'items':$scope.cart.items, 'subtotal':$scope.cart.subtotal}
                }).then(
                    function successCallback(reply) {
                        $window.location.hash = '#/cart'; //Refresh the view.
                    },
                    function errorCallback(reply) {
                        $window.alert('Oops! It broke!');
                    }
                );
            } else {
                $window.location.hash = '#/cart';
            }
        }
    };
    
    /**
     * Get the current cart for a user and convert it into an order.
     */
    $scope.checkout = function () {
        checkoutCart.setCart($scope.cart);
        $window.location.hash = '#/checkout';
    };
    
    $scope.getUserId = function () {
        return $document[0].getElementById('userId').value;  
    };
    
}]);