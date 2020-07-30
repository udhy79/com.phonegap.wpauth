angular.module('myApp.storage', [])

.factory('AuthCookieStorage', function() {
  return {
    get: function() {
      var cookie = window.localStorage['cookie'];
      if(cookie) {
        return angular.fromJson(cookie);
      }
      return {};
    },
    save: function(cookie) {
      window.localStorage['cookie'] = angular.toJson(cookie);
    },
    clear: function() {
      window.localStorage.removeItem('cookie');
    }
  }
})

.factory('UserStorage', function() {
  return {
    get: function() {
      var user = window.localStorage['user'];
      if(user) {
        return angular.fromJson(user);
      }
      return {};
    },
    save: function(user) {
      window.localStorage['user'] = angular.toJson(user);
    },
    clear: function() {
      window.localStorage.removeItem('user');
    }
  }
})