// Register the 'login' component, along with its controller and template

angular.
	module('login').
	component('login', {
		templateUrl: 'login/login.template.html',
		controller: ['$http', '$timeout', '$window', 
			function LoginController($http, $timeout, $window) {

				var self = this;
				var badUsername = function badUsername() {
					return !self.username;
				}
				self.error = "";

				self.msg = "";
				var sendDataToServer = function sendDataToServer(data) {
					return $http.post("http://localhost:3000/login", data)
						.catch(function(err) {
							console.log(err);
							return false;
						});


				}
				var clear = function (toClear) {

					
					$timeout(function() {
						if (toClear == 'error') {
							self.error = '';
							console.log(self.error);
						} else 
							self.msg = '';

					}, 1000);

				}
				self.login = function login() {
					if (badUsername()) {
						console.log("Bad Username");
						self.error = self.username + " has wrong value";
						clear('error');
						return;
					}
					
					var postData = { 
						"username"	: self.username,
						"password"	: self.password
					};

		
					console.log(postData);
					sendDataToServer(postData)
						.then(function(response) {
						if (response.data &&
							response.data.error) {
							self.error = response.data.error; 
							clear('error');
							return false;
						}
						$window.sessionStorage.setItem("token", response.data.token);
						$window.location.href = '/';
					});

				}

				self.register = function register() {
					$window.location.href = '#!/register';
				}





			}
		]
	});

