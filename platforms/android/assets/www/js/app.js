var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        
        ons.setDefaultDeviceBackButtonListener(function() {
            if (navigator.notification.confirm("Are you sure to close the app?", 
                function(index) {
                    if (index == 1) { // OK button
                        navigator.app.exitApp(); // Close the app
                    }
                }
            ));
        });
        
        // Open any external link with InAppBrowser Plugin
        $(document).on('click', 'a[href^=http], a[href^=https]', function(e){

            e.preventDefault();
            var $this = $(this); 
            var target = $this.data('inAppBrowser') || '_blank';

            window.open($this.attr('href'), target);

        });
        
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        //var parentElement = document.getElementById(id);
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');

        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
    
};

(function(){
  'use strict';
  var app = angular.module('app', ['onsen', 'ngSanitize', 'myApp.storage']);
    
    app.config(['$httpProvider', function($httpProvider) {

        $httpProvider.defaults.headers.common['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.cache = false;

    }]);
    
    // Enter here YOUR API BASE URL that you have defined to JSON API Settings
    // Example: http://www.domain.com/api/
    var api_url = 'YOUR API BASE URL';
    
    // Login Controller
    app.controller('LoginController', function($scope, $http, UserStorage, AuthCookieStorage) {
        
        $scope.error = '';
        $scope.afterAuthorization = false;
        
        if (AuthCookieStorage.get()) {
            
            // Validate Auth Cookie
            $http({
            method: 'POST', 
            url: api_url + 'auth/validate_auth_cookie/?cookie=' + AuthCookieStorage.get()
            }).
            success(function(data, status, headers, config) {
                
                $scope.isAuthorized = data.valid;
                $scope.afterAuthorization = true;
                $scope.user = UserStorage.get();
                
            }).
            error(function(data, status, headers, config) {
                
                $scope.afterAuthorization = true;
                $scope.error = 'An error occured:' + status;
                
            }).catch(function (error) {
                
                $scope.afterAuthorization = true;
                $scope.error = 'An error occured';
                
            });
            
        } else {
            
            $scope.afterAuthorization = true; 
            
        }

        // Login function(username, password)
        $scope.login = function(username, password) {
            
            $scope.error = '';
            
            // Create nonce var
            $http({
            method: 'POST', 
            url: api_url + 'get_nonce/?controller=auth&method=generate_auth_cookie'
            }).
            success(function(data, status, headers, config) {
                // Generate Auth Cookie for user authentication
                $http({
                method: 'POST', 
                url: api_url + 'auth/generate_auth_cookie/?nonce=' + data.nonce + '&username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password)
                }).
                success(function(data, status, headers, config) {
                    
                    if(data.status == 'error') {
                        $scope.error = data.error;
                    } else {
                        // Save Auth Cookie to local storage
                        AuthCookieStorage.save(data.cookie);
                        $scope.appNavigator.pushPage('home.html', { animation: 'lift' });
                    }
                    
                }).
                error(function(data, status, headers, config) {
                }).
                catch(function (error) {
                    
                    $scope.error = 'An error occured';
                    
                });
                
            }).
            error(function(data, status, headers, config) {
            }).
            catch(function (error) {
                
                $scope.error = 'An error occured';
                
            });
               
        }
        
        // Reset function()
        $scope.reset = function(){
            
            $scope.appNavigator.pushPage('reset.html', { animation: 'lift' });
            
        }
        
        // Register function()
        $scope.register = function(){
            
            $scope.appNavigator.pushPage('register.html', { animation: 'lift' });
            
        }
        
        // Browse Main Application function()
        $scope.browse = function(){
            
            $scope.appNavigator.pushPage('home.html');
            
        }
        
        // Logout function()
        $scope.logout = function(){
            
            // Clear the local storage
            UserStorage.clear();
            AuthCookieStorage.clear();
            
            $scope.appNavigator.pushPage('login.html');
            
        }
        
        $scope.loadURL = function (url) {
            //target: The target in which to load the URL, an optional parameter that defaults to _self. (String)
            //_self: Opens in the Cordova WebView if the URL is in the white list, otherwise it opens in the InAppBrowser.
            //_blank: Opens in the InAppBrowser.
            //_system: Opens in the system's web browser.
            window.open(url, '_blank', 'location=no');
        }
        
    });
    
    // Menu Controller
    app.controller('MenuController', function($scope, UserStorage, AuthCookieStorage) {
        
        // Logout function()
        $scope.logout = function(){
            
            // Clear the local storage
            UserStorage.clear();
            AuthCookieStorage.clear();
            
            $scope.menu.toggleMenu();
            $scope.appNavigator.pushPage('login.html');
            
        }
        
    });
    
    // Reset Controller
    app.controller('ResetController', function($scope, $http) {

        $scope.reset = function(username){

            // Password Reset
            $http({
            method: 'POST', 
            url: api_url + 'user/retrieve_password/?user_login=' + username
            }).
            success(function(data, status, headers, config) {

                if(data.status == 'error') {
                    $scope.message = data.error;
                } else if (data.status == 'ok') {
                    $scope.message = data.msg; 
                } else {
                    $scope.message = 'Unknown result.'
                }

            }).
            error(function(data, status, headers, config) {});
        }

        $scope.resetBack = function(){
            
            $scope.appNavigator.pushPage('login.html');
            
        }

    });

    // Registration Controller
    app.controller('RegistrationController', function($scope, $http, AuthCookieStorage) {

        // Special Registration Form submission
        $scope.register = function(username, email, display_name, password, repassword) {

            $scope.error = '';

            if (password != repassword) {

                $scope.error = 'Passwords do not match'; 

            } else {

                // Create nonce var
                $http({
                method: 'POST', 
                url: api_url + 'get_nonce/?controller=user&method=register'
                }).
                success(function(data, status, headers, config) {

                    $http({
                        method: 'POST', 
                        url: api_url + 'user/register/?username=' + encodeURIComponent(username) + '&email=' + encodeURIComponent(email) + '&nonce=' + data.nonce + '&display_name=' + encodeURIComponent(display_name) + '&user_pass=' + encodeURIComponent(password)
                    }).
                    success(function(data, status, headers, config) {

                        if(data.status == 'error') {
                            $scope.error = data.error;
                        } else {
                            $scope.login(encodeURIComponent(username), encodeURIComponent(password));
                        }

                    }).
                    error(function(data, status, headers, config) {
                    }).
                    catch(function (error) {

                        $scope.error = 'An error occured';

                    });

                }).
                error(function(data, status, headers, config) {
                }).
                catch(function (error) {

                    $scope.error = 'An error occured';

                });

            }

        }
    
        // Login function(username, password)
        $scope.login = function(username, password) {
            
            $scope.error = '';
            
            // Create nonce var
            $http({
            method: 'POST', 
            url: api_url + 'get_nonce/?controller=auth&method=generate_auth_cookie'
            }).
            success(function(data, status, headers, config) {
                // Generate Auth Cookie for user authentication
                $http({
                method: 'POST', 
                url: api_url + 'auth/generate_auth_cookie/?nonce=' + data.nonce + '&username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password)
                }).
                success(function(data, status, headers, config) {
                    
                    if(data.status == 'error') {
                        $scope.error = data.error;
                    } else {
                        // Save Auth Cookie to local storage
                        AuthCookieStorage.save(data.cookie);
                        $scope.appNavigator.pushPage('home.html', { animation: 'lift' });
                    }
                    
                }).
                error(function(data, status, headers, config) {
                }).
                catch(function (error) {
                    
                    $scope.error = 'An error occured';
                    
                });
                
            }).
            error(function(data, status, headers, config) {
            }).
            catch(function (error) {
                
                $scope.error = 'An error occured';
                
            });
               
        }
        
        $scope.registerBack = function(){
            $scope.appNavigator.pushPage('login.html', { animation: 'lift' });
        }
    
    
            $scope.registerBack = function(){
            $scope.appNavigator.pushPage('login.html');
        }
    
  });
    
    // Server Posts Controller (Server side pagination with AngularJS)
    app.controller('ServerPostsController', function($scope, $http, $filter, ServerPostsData) {
        
        $('.loading').show();
        
        var getData = function ($done) {
            $scope.page = 1;
            $scope.more = false;
            $scope.status_bar = "";
            $scope.posts = [];
            $scope.loadData($done);
        }
        
        $scope.loadData = function ($done) {
            
            $http({method: 'GET', url: ServerPostsData.url + 'page=' + $scope.page}).
            success(function(data, status, headers, config) {
                
                $('.loading').hide();
                if ($done) { $done(); }
                
                $scope.more = data.pages !== $scope.page;
                $scope.posts = $scope.posts.concat(data.posts);
                $scope.status_bar = "Showing " + ($scope.posts.length === 0 ? "0" : "1") + " to " + $filter('number')($scope.posts.length) + " of " + $filter('number')(data.count_total) + " entries";

            }).
            error(function(data, status, headers, config) {
            $('.loading').hide();
            $scope.msg = 'An error occured:' + status;
            if ($done) { $done(); }
            });
            
        }
        
        $scope.load = function($done) {
            getData($done);
        };

        $scope.showMoreItems = function () {
            $scope.page += 1;
            $('.loading').show();
            $scope.loadData();
        }

        $scope.hasMoreItems = function () {
            return $scope.more;
        }

        $scope.page = 1;
        $scope.posts = [];
        $scope.more = true;
        $scope.status_bar = "";
        $scope.loadData();
        
        // getServerPosts() function()
        $scope.getServerPosts = function() {
            // Filter Server Posts by $scope.search
            return $scope.posts.filter(function(item) {
                
                // Filter Server Posts by Title
                var itemDoesMatch = !$scope.search ||
                item.title.toLowerCase().indexOf($scope.search.toLowerCase()) > -1;
                
                // Filter Server Posts by Title or Body
                //var itemDoesMatch = !$scope.search ||
                //item.title.toLowerCase().indexOf($scope.search.toLowerCase()) > -1 || 
                //item.body.toLowerCase().indexOf($scope.search.toLowerCase()) > -1;
                
                return itemDoesMatch;
            });
        };

        // Search Detail function()
        $scope.showSearchDetail = function(index) {
        var items = $scope.getServerPosts();
        var selectedItem = items[index];
        ServerPostsData.selectedItem = selectedItem;
        $scope.appNavigator.pushPage('serverpost.html', selectedItem);
        }
        
    });
    
    // Server Post Controller
    app.controller('ServerPostController', function($scope, ServerPostsData, $sce) {
        $scope.item = ServerPostsData.selectedItem;
        
        $scope.content = $sce.trustAsHtml($scope.item.content);
        
        $scope.loadURL = function (url) {
            //target: The target in which to load the URL, an optional parameter that defaults to _self. (String)
            //_self: Opens in the Cordova WebView if the URL is in the white list, otherwise it opens in the InAppBrowser.
            //_blank: Opens in the InAppBrowser.
            //_system: Opens in the system's web browser.
            window.open(url,'_blank');
        }
        
        $scope.sharePost = function () {
            
            var subject = $scope.item.title;
            var message = $scope.item.content;
            message = message.replace(/(<([^>]+)>)/ig,"");

            var link = $scope.item.url;
            
            //Documentation: https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin
            //window.plugins.socialsharing.share('Message', 'Subject', 'Image', 'Link');
            window.plugins.socialsharing.share(message, subject, null, link);
        }
        
    });

})();

