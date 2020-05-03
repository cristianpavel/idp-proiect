// Declare app level module which depends on views, and core components
window.config = {
	login_service: {
		host: 'http://3.9.146.230',
		port: '8080'
	},
	user_data_service: {
		host: 'http://3.9.146.230',
		port: '9000'
	},
	all_users_service: {
		host: 'http://3.9.146.230',
		port: '9000'
	},
	account_service: {
		host: 'http://3.9.146.230',
		port: '8090'
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
