/*globals angular:false, confirm:false, alert:false, document:false, app:false , $window: false*/
'use strict';

/**
 * Controller for the product detail page.
 */
angular.module('singlepage').controller('PdpController', ['$scope', '$http', '$routeParams', '$document', '$window', 'endpoints', 
function($scope, $http, $routeParams, $document, $window, endpoints) {
    $scope.addtowishlist = $scope.addtowishlist || false;
    $scope.product = $scope.product || {};
    $scope.message = $scope.message || undefined;
    $scope.addedMessage = $scope.addedMessage || undefined;
    $scope.lineitem = $scope.lineitem || {};
    
    /**
     * Get data for a specific product.
     */
    $scope.getProduct = function () {
        
        $http.get(endpoints.products.replace('{{productId}}', $routeParams.productid)).then(
        function successCallback(reply) {
            
            $scope.product = reply.data[0];
            $scope.lineitem = $scope.setLineItem($scope.product);
            $document[0].title = $document[0].title + $scope.product.name;
           
        }, function errorCallback(response) { 
            
            $window.alert('Oops! It broke!');
        
        });
    };

    /**
     * Add the loaded product to a cart.
     */
    $scope.addToCart = function() {
        var userId = $scope.getUserId();
        if ($scope.lineitem.size === '') {
            $scope.setMessage('Please select a size!');
            return false;
        }
        if (parseInt($scope.lineitem.quantity) < 1 || parseInt($scope.lineitem.quantity) > 255) {
            $scope.setMessage('Quantity must be between 1 and 255');
            return false;
        }
        
        if (userId === '') {
            $window.alert('Please login to add to your personal cart.');
            return false;
        }
        //Get all carts for a user.
        $http.get(endpoints.cart.replace('{{userId}}', userId)
                                .replace('/{{cartId}}', '')).then(
            function successCallback(reply) {
                var cartId = '';
                if (reply.data[0]) {
                    cartId = reply.data[0].cart_id;
                } 
                //Get the latest cart for a user.
                if (cartId !== '') {  
                    $http.get(endpoints.cart.replace('{{userId}}', userId)
                                            .replace('{{cartId}}', cartId)).then(
                        function successCallback(reply) {
                            var items = reply.data[0].items || [];
                            var subtotal = 0;
                            $scope.lineitem.linenumber = items.length + 1;
                            items.push($scope.lineitem);
                            for(var x=0; x< items.length; x++) {
                                subtotal += parseFloat(items[x].price) * parseInt(items[x].quantity);   
                            }
                            //Put the item into the cart.
                            $http({
                                method: 'PUT', 
                                responseType: 'json',
                                url: endpoints.cart.replace('{{userId}}', userId)
                                                .replace('{{cartId}}', cartId), 
                                data: {'items':items, 'subtotal':subtotal}
                            }).then(
                                function successCallback(reply) {
                                    $scope.addedMessage = 'Item added to cart!';
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
                    var items = [];
                    var subtotal = 0;
                    $scope.lineitem.linenumber = items.length + 1;
                    items.push($scope.lineitem);
                    for(var x=0; x< items.length; x++) {
                        subtotal += parseFloat(items[x].price) * parseInt(items[x].quantity);   
                    }
                    //Put the item into the cart.
                    $http({
                        method: 'POST', 
                        responseType: 'json',
                        url: endpoints.cart.replace('{{userId}}', userId)
                                        .replace('/{{cartId}}', ''), 
                        data: {'userid': $scope.userId, 'items':items, 'subtotal':subtotal}
                    }).then(
                        function successCallback(reply) {
                            $scope.addedMessage = 'Item added to cart!';
                        },
                        function errorCallback(reply) {
                            $window.alert('Oops! It broke!');
                        }
                    );
                }
            },
            function errorCallback(reply) {
                $window.alert('Oops! It broke!');
            }
        );
    };  
    
    /**
     * For setting up the item that will be added to the cart. Line items are a subset of products.
     * @param {object} An object containing the product's information. This is typically the raw data returned from the API.
     */
    $scope.setLineItem = function (product) {
        return {
            productname: product.name,
            productdescription: product.description,
            product_id: product.product_id,
            size: '',
            price: parseFloat((product.saleprice.toFixed(2) < product.listprice.toFixed(2)) ? product.saleprice.toFixed(2) : product.listprice.toFixed(2)),
            quantity: 1
        };
    };
    
    $scope.addToWishList = function() {
        $scope.addtowishlist = !$scope.addtowishlist;
    };
    
    /**
     * Determine if the product is on sale or not. This is simply for display purposes and NOT for actually making calculations.
     * @param {float} salePrice - The sale price of the product.
     * @param {float} listPrice - The regular price of the product.
     * @returs {boolean} 
     */
    $scope.isOnSale = function(salePrice, listPrice) {
        if (salePrice && listPrice){ 
            return (Math.round(salePrice * 100) / 100) < (Math.round(listPrice * 100) / 100);
        } else {
            return false;
        }
    };
    
    /**
     * Sets the message displayed in the attached view.
     * @param {string} The text of the message to set in hte view.
     */
    $scope.setMessage = function(messageText) {
        $scope.message = messageText;  
    };
    
    $scope.getUserId = function () {
        return $document[0].getElementById('userId').value;  
    };
}]);
