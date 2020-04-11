var connection = require('../connection.js')
var getNSessionsSpecificUser = require('./get-sessions.js');
var {promisify} = require('util');
var async = require('async');
const ACTIVE_USERS = 1;
const INACTIVE_USERS = 0;
const ALL_USERS = 2;
const HOLIDAY = 3;
const MAX_INTEGER32 = 2147483647;


var getNMostProductiveUsers = function getNMostProductiveUsers(N, callback) {

	const collection = connection.client.db('db').collection('sessions');
	collection.aggregate(
		[
			{
				$match: {
					valid: true
				}
			},
			{
				$group: {
					_id: "$username",
					avgSession: {
						$avg: {
							$subtract: ["$end", "$start"]
						}
					}
				}
			},
			{
				$sort: {
					avgSession: -1
				}
			}, {
				$limit: N
			}
		]).toArray(callback);
}

function getHolidayUsers(search, lastUser, callback) {

	const collection = connection.client.db('db').collection('holidays')
	console.log(lastUser.username);
	collection.mapReduce(
		function() {
			emit(this.username, this)
		},
		function (key, values) {
			
			in_holiday = false;
			values.forEach(function(value) {
				if (now >= value.start &&
					now < value.end) {
					in_holiday = true;
				}
			})

			if (in_holiday)
				return { username: key, holiday: true};
		},
		{
			query: {
				username: {
					$regex: search,
				},
				uppercase_username: {
					$gte: lastUser.username.toUpperCase()
				}
					
			},
			out: {
				inline: 1
			},
			scope: {
				now: new Date().getTime()
			},
			finalize: function (key, value) {
				if (value === null) {
					return;
				}
				if (value.holiday !== undefined) return value;
				if (now >= value.start &&
					now < value.end) {
					return {username: key, holiday: true}
				}

			}
		}, function (err, result) {
			if (err) {
				console.log(err);
			}
			result = result || [];
			callback(err, result.map((x) => x.value).filter((x) => {
				return x !== null
			}));
		});



}

function getLastSession(messageBody, user_type, callback) {
	const collection = connection.client.db('db').collection('sessions');
	var scope = {
		user_type: user_type,
		ALL_USERS: ALL_USERS,
		ACTIVE_USERS: ACTIVE_USERS,
		INACTIVE_USERS: INACTIVE_USERS,
	}

	var username = messageBody.username || "";
	async.waterfall([
		function (cb) {
			getHolidayUsers("^" + username + ".*", messageBody.lastUser, cb);
		}
	], function (err, in_holiday) {
		if (err) {
			callback(err);
			return;
		}
		if (user_type === HOLIDAY) {
			callback(null, in_holiday);
			return;
		}

		inHolidayS = {};
		for (let i = 0; i < in_holiday.length; i++) {
			inHolidayS[in_holiday[i].username] = true;
		}
		scope['inHoliday'] = inHolidayS;
		collection.mapReduce(
			function() {
				if (inHoliday[this.username] === true)
					return;

				emit(this.username, this)
			},
			function(key, values) {
				max = null;
				entry = null;
				values.forEach(function(value) {
					if (max == null || value.end > max) {
						max = value.end;
						entry = value;
					}


				});


				if (user_type === ALL_USERS) {
					return {...entry, type:user_type};
				} else if (user_type === ACTIVE_USERS &&
					entry.valid == false) {
					return {...entry, type:user_type};
				} else if (user_type === INACTIVE_USERS &&
					entry.valid == true) {
					return {...entry, type:user_type};
				}

			},
			{
				finalize: function (key, entry) {
					if (entry === null) return;
					if (entry.type) return entry;

					if (user_type === ALL_USERS) {
						return {...entry, type:user_type};
					} else if (user_type === ACTIVE_USERS &&
						entry.valid == false) {
						return {...entry, type:user_type};
					} else if (user_type === INACTIVE_USERS &&
						entry.valid == true) {
						return {...entry, type:user_type};
					} 					
				},
				scope: scope,
				query: {
					username: {
						$regex: "^" + username + ".*"
					},
					uppercase_username: {
						$gt: messageBody.lastUser.username.toUpperCase()
					},
					start: {
						$lt: new Date().getTime()
					}
					
				},
				out: {
					inline: 1
				},
				sort: {
					username: 1
				}
			},
			function (err, result) {
				if (err || !result) {
					console.log(err);
					callback(err);
					return;
				}
				let users = result.map((x) => x.value).filter((x) => {
					return x !== null
				});
				allUsers = users;	
				if (user_type === ALL_USERS)
					allUsers = users.concat(in_holiday);
				allUsers.sort((a, b) => a.username.localeCompare(b.username));
				callback(null, allUsers.slice(0, messageBody.noUsers));
				return;

			})
		});


}

exports.getAllUsers = function(req, res) {

	var messageBody = req.body;
	console.log(messageBody);
	getLastSession(messageBody, ALL_USERS, function (err, users) {
		if (err) {
			return;
		}
		res.send(users);
	});

}
exports.getHolidayUsers = function(req, res) {
	
	var messageBody = req.body;
	console.log(messageBody);
	getLastSession(messageBody, HOLIDAY, function (err, users) {
		if (err) {
			return;
		}
		res.send(users);
	});

}


exports.getActiveUsers = function(req, res) {
	
	var messageBody = req.body;
	console.log(messageBody);
	getLastSession(messageBody, ACTIVE_USERS, function (err, users) {
		if (err) {
			return;
		}
		res.send(users);
	});

}

exports.getInactiveUsers = function(req, res) {
	var messageBody = req.body;
	console.log(messageBody);
	getLastSession(messageBody, INACTIVE_USERS, function (err, users) {
		if (err) {
			return;
		}
		res.send(users);
	});
	
}


exports.getProductiveUsers = function(req, res) {

	var messageBody = req.body;
	console.log(messageBody);
	var users = [];
	getNMostProductiveUsers(Number(messageBody.noUsers), function(err, response) {

		console.log(err);
		console.log(response);
		response.forEach(function(doc) {
			users.push(
				{
					username: doc._id,
					avg: doc.avgSession
				}
			);

		});

		res.send(users);


	});

};

exports.getSpecificUser = function (req, res) {



	var messageBody = req.body;
	console.log(messageBody);
	var messageBody = req.body;
	
	getLastSession(messageBody, messageBody.user_type, function (err, users) {
		if (err) {
			return;
		}
		res.send(users);
	});
	
	

};
