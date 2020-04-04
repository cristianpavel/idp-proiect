
angular.
  module('myApp').
  config(['$routeProvider', '$compileProvider',
    function config($routeProvider, $compileProvider) {
      $routeProvider.
	when("/login", {
		template: "<login></login>"
	}).
	when("/register", {
		template: "<register></register>"
	}).
        when("/account", {
          template: "<user-session></user-session>"
        }).
        when("/users", {
          template: "<users></users>"
        }).
	when("/users/:userId", {
	  template: "<user-data></user-data>"
	}).
        otherwise({redirectTo: "/account"});
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|javascript):/);
  }
  ]);
