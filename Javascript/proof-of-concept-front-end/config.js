'use strict';

module.exports = {
    'applicationname':'singlepage',
    'appPort':'8086',
		'servicePort': '8085',
    'secret':'cb135fbb74e0dcf8d59cef557766deea0b11271bbcca204994a7140d2051056d',
    'endpoints' : {
		products: '{HOSTPROTO}:{SERVICEPORT}/products/{{productId}}',
		search: '{HOSTPROTO}:{SERVICEPORT}/products/search/{{searchTerm}}',
		cart: '{HOSTPROTO}:{SERVICEPORT}/users/{{userId}}/carts/{{cartId}}',
		order: '{HOSTPROTO}:{SERVICEPORT}/users/{{userId}}/orders',
		wishlist: '{HOSTPROTO}:{SERVICEPORT}/users/{{userId}}/wishlists/{{wishlistId}}',
		profile: '{HOSTPROTO}:{SERVICEPORT}/users/{{userEmail}}/profile'
    }
};