// Register the 'userSession' component, along with its controller and template

angular.
	module('userSession').
	component('userSession', {
		templateUrl: 'user-session/user-session.template.html',
		controller: ['$http', '$timeout', '$window', '$scope',
			function UserSessionController($http, $timeout, $window, $scope) {

				var self = this;
				self.error = "";


				self.msg = "";
				
				
				var sendDataToServer = function sendDataToServer(path, data) {
					return $http.post('http://localhost:3000/account' + path, data, {headers: 
						{'x-access-token' : self.token}})
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
				self.startSession = function startSession() {
				
					if (self.in_holiday) {
						self.error = self.username + " is in holiday.";
						clear('error');
						return false;

					}
					var postData = { 
						"username"	: self.username,
						"active"	: 1
					};

		
					console.log(postData);
					sendDataToServer("/modifySession", postData)
						.then(function(response) {
						if (response.data &&
							response.data.error) {
							self.error = self.username + " is already active. Press End first.";
							clear('error');
							return false;
						}
						
						self.msg = self.username + " has started his/her session.";
						self.init();
						clear(self.msg);
					});

				}

				self.endSession = function endSession() {
					if (self.in_holiday) {
						self.error = self.username + " is in holiday.";
						clear('error');
						return false;

					}
					
					var postData = { 
						"username"	: self.username,
						"active"	: 0
					};

		
					console.log(postData);
					sendDataToServer("/modifySession", postData)
						.then(function(response) {
						if (response.data &&
							response.data.error) {
							console.log("error");
							self.error = self.username + " is not active. Press Start first.";
							clear('error');
							return false;
						}

						self.msg = self.username + " has ended his/her session.";
						self.init();
						clear('msg');
						
					});


				}

				self.init = function init() {

					self.token = $window.sessionStorage.getItem("token");
					if (!self.token) {
						$window.location.href = '#!/login';
					}
					today = new Date()
					self.minDate = new Date(today);
					self.minDate = self.minDate.toISOString().substring(0, 10);
					console.log(self.minDate);
					sendDataToServer('/', {}) 
						.then(function(response) {
							self.username = response.data.user.username;
							self.team = response.data.user.team;
							self.dept = response.data.user.dept;
							self.remaining = response.data.user.remaining_holidays;	
							self.is_admin = response.data.user.is_admin;
							var now = new Date().getTime();
							var in_holiday = false;
							for (let i = 0; i < response.data.holidays.length; i++) {
								holiday = response.data.holidays[i];
								if (holiday.start <= now &&
									holiday.end >= now) {
									in_holiday = true;
									break;
								}

							}
							self.in_holiday = in_holiday;
							self.valid = response.data.session.length === 0 || 
								response.data.session[0].valid;
							
							
							self.holidays = response.data.holidays.map((x) => {
								duration =
									moment(new Date(x.start)).businessDiff(moment(new Date(x.end)));
								return {
									...x,
									duration: duration
								}
							});

							return sendDataToServer('/getUsers', {});
							
						}).then((response) => {
							if (response.data &&
								response.data.error) {
								console.log("error");
								self.error = response.data.error;
								clear('error');
								return false;
							}
							self.ddUsers = response.data.map((x) => {
								return {
									text: x.username
								}
							})
							self.ddDays = [];
							for (let i = 0; i < 261; i++) {
								self.ddDays.push({
									text: i
								});
							}
							return sendDataToServer('/getDept', {});
						}).then((response) => {
							if (response.data &&
								response.data.error) {
								console.log("error");
								self.error = response.data.error;
								clear('error');
								return false;
							}
						
							self.ddDepts = response.data.map((x) => {
								return {
									text: x.name
								}
							});
								
							
						});

					
				}

				self.init();

				self.addHoliday = function addHoliday() {

					if (!self.to || !self.from || 
						self.to < self.from) {
						return;
					}


					days = moment(new Date(self.to)).businessDiff(moment(new Date(self.from)));

					console.log(days);
					if (days >= self.remaining) {
						self.error = self.username + " has just " + self.remaining + " days left";
						clear('error');
						return false;

					}

					start = new Date(self.from);
					end = new Date(self.to);
					end.setDate(end.getDate() + 1);

					sendDataToServer('/addHoliday', {
						start: start.toISOString().substring(0, 10),
						end: end.toISOString().substring(0, 10)
					}).then((response) => {
						if (response.data &&
							response.data.error) {
							console.log("error");
							self.error = response.data.error;
							clear('error');
							return false;
						}
						self.init();		
						console.log(response);
					});
					
					


				}
				$scope.$watch('$ctrl.from', function () {
					self.previousFrom = new Date(self.from);
					self.previousFrom.setDate(self.previousFrom.getDate() - 1);
					self.previousFrom = self.previousFrom.toISOString().substring(0, 10);

				});
				self.addTeam = function addTeam() {

					if (!self.newTeamManager ||
						!self.newTeam ||
							!self.newTeamDept) {
						self.error = "Please complete all fields";
						clear('error');
						return;
					}

					sendDataToServer('/addTeam', {
						manager: self.newTeamManager.text,
						name: self.newTeam,
						dept: self.newTeamDept.text
					}).then((response) => {
						if (response.data &&
							response.data.error) {
							console.log("error");
							self.error = response.data.error;
							clear('error');
							return false;
						}
						self.msg = self.newTeam + " has been added / updated.";

						clear(self.msg);
					
					});

				}
				self.addDept = function addDepartment() {
					if (!self.newDeptManager ||
						!self.newDept ||
							!self.newDeptDays) {
						self.error = "Please complete all fields";
						clear('error');
						return;
					}
					sendDataToServer('/addDepartment', {
						manager: self.newDeptManager.text,
						name: self.newDept,
						maxHolidaysAllowed: self.newDeptDays.text
					}).then((response) => {
						if (response.data &&
							response.data.error) {
							console.log("error");
							self.error = response.data.error;
							clear('error');
							return false;
						}
						self.msg = self.newDept + " has been added / updated.";
						self.init();
						clear(self.msg);
					
					});

				}


				self.logout = function logout() {

					$window.sessionStorage.removeItem('token');
					$window.location.href = '/';


				}

			}
		]
	});
