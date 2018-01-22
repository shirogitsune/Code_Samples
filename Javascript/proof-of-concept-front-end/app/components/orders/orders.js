/*globals angular:false, confirm:false, alert:false, document:false, app:false, $window:false */
'use strict';

/**
 * Controller for the orders page.
 */
angular.module('singlepage').controller('OrderController', ['$scope', '$http', '$document', '$window', 'cartToCheckout', 'endpoints', 
function ($scope, $http, $document, $window, checkoutCart, endpoints){
    $scope.orderslist = $scope.orderslist || {};
    $scope.currentOrder = $scope.currentOrder || {};
    $scope.userId = $scope.userId || '';
    $scope.userEmail = $scope.userEmail || '';
    
    /**
     * Get a list of orders for the given user.
     */
    $scope.getOrders = function() {
        $scope.userId = $scope.getUserId();
        if ($scope.userId !== '') { 
            $http.get(endpoints.order.replace('{{userId}}', $scope.userId)).then(
                function successCallback(reply) {
                    $scope.orderslist.orders = reply.data;
                },
                function errorCallback(reply) {
                    $window.alert('Oops! It broke!'); 
                }
            );
        } else {
            $window.location.hash = '#/login';
            $window.alert('Please login to view your orders.');
        }
    };
    
    /**
     * Get the order information needed to do checkout. If the cart can't be located, go to the cart page.
     */
    $scope.doCheckout = function () {
        var cart = checkoutCart.getCart();
        $scope.userId = $scope.getUserId();
        $scope.userEmail = $scope.getUserEmail();
        if (cart === undefined) {
            $window.location.hash = '#/cart';
            return false;
        }
        if ($scope.userId !== '' && $scope.userEmail !== '') { 
            $http.get(endpoints.profile.replace('{{userEmail}}', $scope.userEmail)).then(
                function successCallback(reply){
                    $scope.currentOrder.userid = $scope.userId;
                    $scope.currentOrder.email = $scope.userEmail;
                    for (var a in reply.data.addresses) {
                        if (reply.data.addresses[a].type === 'billing') {
                            $scope.currentOrder.billingaddress = reply.data.addresses[a];
                        } else if (reply.data.addresses[a].type === 'shipping') {
                            $scope.currentOrder.shippingaddress = reply.data.addresses[a];
                        }
                    }
                    if ($scope.currentOrder.billingaddress === undefined || 
                        $scope.currentOrder.shippingaddress === undefined) {
                        $window.alert('Please update your billing or shipping address before proceeding');
                        $window.location.hash = '#/profile';
                    }
                    
                    $scope.currentOrder.items = cart.items;
                    $scope.currentOrder.subtotal = cart.subtotal;
                    $scope.currentOrder.shipping = parseFloat('12.37');
                    $scope.currentOrder.tax = cart.subtotal * 0.055;
                    $scope.currentOrder.shipmethod = 'Standard';
                    $scope.currentOrder.total = $scope.currentOrder.subtotal 
                                            + $scope.currentOrder.shipping
                                            + $scope.currentOrder.tax;
                },
                function errorCallback(reply){
                    $window.alert('Oops! It broke.');
                    $window.location.hash = '#/cart';
                }
            );
        } else {
            $window.alert('Please login before checking out');
            $window.location.hash = '#/cart';
        }
        
    };
    
    /**
     * Create an order and send it to the API.
     */
    $scope.placeOrder = function () {
        if ($scope.userId !== '' && $scope.userEmail !== '') { 
            if ($window.confirm('You are about to place an order. Are you sure?')) {
                $http({
                    method: 'POST',
                    responseType: 'text',
                    url: endpoints.order.replace('{{userId}}', $scope.userId),
                    data: $scope.currentOrder
                }).then(
                    function successCallback(reply) { //Success
                        if (reply.data !== undefined) {
                            $window.alert('Order Successful! Your order ID is:\n' + reply.data);
                            $window.location.hash = '#/orders';
                        } else {
                            $window.alert('There was an error processing your order. Please check your order and try again.');
                            $window.location.hash = '#/cart';
                        }
                    },
                    function failureCallback(reply) { //Error
                        $window.alert('There was an error processing your order. Please check your order and try again.');
                        $window.location.hash = '#/cart';
                    }
                );
            }
        } else {
            $window.alert('Please login before placing your order');
            $window.location.hash = '#/cart';
        }
    };
    
    $scope.getUserId = function () {
        return $document[0].getElementById('userId').value;  
    };
    
    $scope.getUserEmail = function () {
        return $document[0].getElementById('userEmail').value;  
    };
    
}]);