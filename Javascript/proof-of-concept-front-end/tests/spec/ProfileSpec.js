/*globals describe:false, it:false, beforeEach:false, 
  afterEach:false, spyOn:false, expect:false, inject:false, 
  angular: false;*/
'use strict';

describe('Profile Controller Tests', function() {
    describe('The Profile Controller', function() {
        var $controller, $httpBackend, testProfile;
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
        
        // Setup mock data
        beforeEach(function() {
            //Mockup of the profile data
            testProfile = {
                firstname: 'Test',
                lastname: 'Profile',
                email: 'sample@footlocker.com',
                preferences: ['A', 'B', 'C'],
                addresses: [
                    {
                        type: 'billing',
                        name: 'home',
                        line1: '123 Any St.',
                        Line2: '',
                        city: 'Anytown',
                        state: 'WI',
                        zipcode: '12345'
                    },
                    {
                        type: 'billing',
                        name: 'work',
                        line1: '321 Any St.',
                        Line2: '',
                        city: 'Anytown',
                        state: 'WI',
                        zipcode: '12345'
                    }
                ]
            };
            //Mock location hash
            $windowMock.location.hash = '';
        });
        
        //Set up the application and install the mock providers to the application
        beforeEach(function() {
            module('singlepage', function($provide) {
                $provide.value('$window', $windowMock);
                $provide.value('$document', $documentMock);
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
         * Testing the method for getting a profile.
         */
        it('should get profile information for a user.', function() {
            var $scope = {};
            
            $controller('ProfileController', {$scope: $scope}, {$http: $httpBackend});
            
            $httpBackend.expectGET(/\/users\/sample@footlocker.com\/profile$/).respond(200, testProfile);
            
            $scope.getProfile();
            
            $httpBackend.flush();
            
            expect($scope.userProfile).toBeDefined();
            expect($scope.userProfile.firstname).toBe(testProfile.firstname);
            expect($scope.userProfile.lastname).toBe(testProfile.lastname);
            expect($scope.userProfile.email).toBe(testProfile.email);
            expect($scope.userProfile.preferences.length).toBe(testProfile.preferences.length);
            expect($scope.userProfile.addresses.length).toBe(testProfile.addresses.length);
        });
        
        /**
         * Testing the method for getting a profile.
         */
        it('should strip the password out of the profile data that is returned.', function() {
            var $scope = {};
            
            $controller('ProfileController', {$scope: $scope}, {$http: $httpBackend});
            
            $httpBackend.expectGET(/\/users\/sample@footlocker.com\/profile$/).respond(200, testProfile);
            
            $scope.getProfile();
            
            $httpBackend.flush();
            
            expect($scope.userProfile.password).not.toBeDefined();
            
        });
        
        /**
         * Testing the method for toggling edit mode.
         */
        it('should allow toggling of edit mode.', function() {
            var $scope = {
                userEmail: 'sample@footlocker.com',
                userProfile: {}
            };
                        
            $controller('ProfileController', {$scope: $scope}, {$http: $httpBackend});
            
            $scope.toggleEditMode();
            
            expect($scope.editMode).toBe(true);
            
            $scope.toggleEditMode();
            
            expect($scope.editMode).toBe(false);
            
        });
        
        /**
         * Testing the copying of profile information for 
         * going ot edit mode (so that the profile can be set back to
         * a prior state without an HTTP call).
         */
        it('should copy the profile when switching to edit mode.', function() {
            var $scope = {
                userEmail: 'sample@footlocker.com',
                userProfile: {}
            };
            
            angular.copy($scope.userProfile, testProfile);
            
            $controller('ProfileController', {$scope: $scope}, {$http: $httpBackend});
            
            $scope.toggleEditMode();
            
            expect($scope.editProfile).toBeDefined();
            expect($scope.editProfile).toEqual(testProfile);
            expect($scope.editMode).toBe(true);
            
            $scope.toggleEditMode();
            
            expect($scope.editProfile).toBeDefined();
            expect($scope.editProfile).toEqual({});
            expect($scope.editMode).toBe(false);
        });
        
        /**
         * Test the method for adding an address.
         */
        it('should allow for adding an address.', function() {
            var $scope = {
                userEmail: 'sample@footlocker.com',
                editMode: true,
                userProfile: {},
                editProfile: {}
            };
            
            angular.copy(testProfile, $scope.userProfile);
            angular.copy(testProfile, $scope.editProfile);
            
            $controller('ProfileController', {$scope: $scope}, {$http: $httpBackend});

            $scope.addAddress();
            
            expect($scope.editProfile.addresses.length).toBeGreaterThan($scope.userProfile.addresses.length);
        });
        
        /**
         * Test the method for removing an address.
         */
        it('should allow for removing an address.', function() {
            var $scope = {
                userEmail: 'sample@footlocker.com',
                editMode: true,
                userProfile: {},
                editProfile: {}
            };
            
            angular.copy(testProfile, $scope.userProfile);
            angular.copy(testProfile, $scope.editProfile);
            
            $controller('ProfileController', {$scope: $scope}, {$http: $httpBackend});

            $scope.removeAddress(0);
            
            expect($scope.editProfile.addresses.length).toBeLessThan($scope.userProfile.addresses.length);
        });
        
        /**
         * Test the method for adding a preference.
         */
        it('should allow for adding a preference.', function() {
            var $scope = {
                userEmail: 'sample@footlocker.com',
                editMode: true,
                userProfile: {},
                editProfile: {}
            };
            
            angular.copy(testProfile, $scope.userProfile);
            angular.copy(testProfile, $scope.editProfile);
            
            $controller('ProfileController', {$scope: $scope}, {$http: $httpBackend});

            $scope.addPreference();
            
            expect($scope.editProfile.preferences.length).toBeGreaterThan($scope.userProfile.preferences.length);
        });
        
        /**
         * Test the method for removing a preference.
         */
        it('should allow for removing a preference.', function() {
            var $scope = {
                userEmail: 'sample@footlocker.com',
                editMode: true,
                userProfile: {},
                editProfile: {}
            };
            
            angular.copy(testProfile, $scope.userProfile);
            angular.copy(testProfile, $scope.editProfile);
            
            $controller('ProfileController', {$scope: $scope}, {$http: $httpBackend});

            $scope.removePreference(0);
            
            expect($scope.editProfile.preferences.length).toBeLessThan($scope.userProfile.preferences.length);
        });
        
        /**
         * Test the method for saving profile information to the API.
         */
        it('should allow for saving a profile.', function() {
            var $scope = {
                userEmail: 'sample@footlocker.com',
                editMode: true,
                userProfile: {},
                editProfile: {}
            };
            
            angular.copy(testProfile, $scope.userProfile);
            angular.copy(testProfile, $scope.editProfile);
            $scope.editProfile.firstname = 'Edit';
            
            $controller('ProfileController', {$scope: $scope}, {$http: $httpBackend});

            $httpBackend.expectPUT(/\/users\/sample@footlocker.com/, $scope.userProfile).respond(200, 'Ok');
            
            $scope.saveProfile();
            
            $httpBackend.flush();
            
            expect($scope.editMode).toBe(false);
            expect($scope.editProfile).toEqual({});
            expect($scope.userProfile).not.toEqual(testProfile);
            expect($scope.userProfile.firstname).toBe('Edit');
            expect($windowMock.location.hash).toBe('#/profile');
            
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