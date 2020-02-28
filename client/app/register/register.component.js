// Register the 'login' component, along with its controller and template

angular.
	module('register').
	component('register', {
		templateUrl: 'register/register.template.html',
		controller: ['$http', '$timeout', '$window',
			function RegisterController($http, $timeout, $window) {

				var self = this;
				var badUsername = function badUsername() {
					return !self.username;
				}

				var badEmail = function badEmail() {
					return !self.email || self.email.indexOf('@') === -1;
				}
				self.error = "";

				self.msg = "";
				var sendDataToServer = function sendDataToServer(path, data) {
					return $http.post(path, data)
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
				self.register = function login() {
					if (badUsername() ||
						badEmail() ||
							!self.team ||
							!self.password) {
						self.error = "Wrong fields.";
						clear('error');
						return;
					}
					
					var postData = { 
						"username"	: self.username,
						"password"	: self.password,
						"email"		: self.email,
						"team"		: self.team.text,
					};

		
					console.log(postData);
					sendDataToServer('/register', postData)
						.then(function(response) {
						if (!response.data) {
							return;
						}
						if (response.data &&
							response.data.error) {
							self.error = response.data.error; 
							clear('error');
							return false;
						}
						sessionStorage.token = response.data.token;
						$window.location.href = '/';
					});

				}

				self.init = function init() {
					sendDataToServer('http://localhost:3000/account/getTeams', {})
						.then((response) => {
					  		if (response.data &&
                                                                response.data.error) {
                                                                console.log("error");
                                                                self.error = response.data.error;
                                                                clear('error');
                                                                return false;
                                                        }

                                                        self.ddTeams = response.data.map((x) => {
                                                                return {
                                                                        text: x.name
                                                                }
                                                        });
						});

				}
				
				self.init();




			}
		]
	});

