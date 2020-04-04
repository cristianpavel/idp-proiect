// Declare app level module which depends on views, and core components
window.config = {
	login_service: {
		host: 'http://login',
		port: '8080'
	},
	user_data_service: {
		host: 'localhost',
		port: '3000'
	},
	all_users_service: {
		host: 'http://localhost',
		port: '3000'
	},
	account_service: {
		host: 'http://localhost',
		port: '3000'
	}
}

angular.module('myApp', [
  'ngRoute',
  'ngDropdowns',
  '720kb.datepicker',
  'googlechart',
  'userSession',
  'register',
  'users',
  'userData',
  'login'
]);
