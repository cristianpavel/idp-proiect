// Register the 'userSession' component, along with its controller and template

angular.
	module('users').
	component('users', {
		templateUrl: 'users/users.template.html',
		controller: ['$http', '$routeParams', '$window',
			function UsersController($http, $routeParams, $window) {

				var self = this;
				
				var noUsersPerPage = 10;
				var searchInput = '';
				var postPath = '/users';
				var users_service = $window.config.all_users_service;
				var users_path = users_service.host + ":" +
							users_service.port;

				var getFromServer = function getFromServer(postPath, postData) {
					console.log(postPath);
					console.log(postData);
					$http.post(users_path + postPath, postData).then(function(response) {
						console.log(response.data);
						if (response.data.error) {
							self.users = undefined;
							return;
						}

						self.users = response.data;

					});
					
				}

				var getUserType = function getUserType() {

					if (self.ddSelectSelected.value === 'all')
						return 2;
					else if (self.ddSelectSelected.value === 'active')
						return 1;
					else if (self.ddSelectSelected.value === 'inactive')
						return 0;
					else
						return 3;
				}
			
				
				self.search = '';
				
				self.ddSelectOptions = [
					{
						text: 'All',
						value: 'all'
					},
					{
						text: 'Active',
						value: 'active'
					},
					{
						text: 'Inactive',
						value: 'inactive'
					},
					{
						text: 'Holiday',
						value: 'holiday'
					}
				];
				self.noUsersProductive = 5;
				self.ddSelectSelected = self.ddSelectOptions[0];

				self.onSelectionChanged = function onSelectionChanged(selected) {
				
					searchInput = '';
					var postData = {
						lastUser: {
							username: ''
						},

						noUsers: noUsersPerPage
					}
					

					switch(selected.value) {
					case 'active':
						postPath = '/users/active';
						break;
					case 'inactive':
						postPath = '/users/inactive';
						break;
					case 'holiday':
						postPath = '/users/holiday';
						break;
					default:
						postPath = '/users';
					

					}

					getFromServer(postPath, postData); 
				}
				
				self.onSelectionChanged(self.ddSelectSelected);

				self.nextPage = function nextPage() {
					if (!self.users || self.users.length < noUsersPerPage)
						return;
					
					console.log("Next");	
					getFromServer(postPath,
						{
							user_type: getUserType(),
							username: searchInput,
							lastUser: {
								username: self.users.length ? self.users[self.users.length - 1].username : ''
							},
							noUsers: noUsersPerPage
						});
				}

				self.getProductiveUsers = function () {
					self.usersProductive = undefined;
					$http.post(users_path + '/users/productive', {
						noUsers: self.noUsersProductive
					}).then(function(response) {
						console.log('Got Most Productive');
						self.usersProductive = response.data;
					});
				}
				self.getProductiveUsers();

				self.searchUser = function(keyEvent) {
					if (keyEvent.which == 13) {
						searchInput = self.search;
						postPath = '/users/user';
						postData = {
							user_type: getUserType(),
							username: self.search,
							lastUser: {
								username: ''
							},
							noUsers: noUsersPerPage
						};
						
						
						getFromServer(postPath, postData);
						

					}

				}



			}
		]
	});
