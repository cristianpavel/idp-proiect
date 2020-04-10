var connection = require('../connection.js'); 
var uuid = require('uuid/v4')
var async = require('async')
var moment = require('moment-business-days')
var md5 = require('md5')

var getHitsFromResponse = function getHitsFromResponse(response) {
	return response;
}

var getUser = function getUser(req, callback) {
        var token = req.headers['x-access-token'];

        if (!token) {
                callback({message: "No token provided"});
                return;
        }

        jwt.verify(token, config.secret, function(err, decoded) {
                if (err) {
                        callback({message: 'Failed to authenticate token.'});
                        return;
                }

                callback(null, decoded.id);

        });
}


var getNSessionsSpecificUser = function getNSessionsSpecificUser(user,
								 N,
								 pageNo,
								 callback) { 
        const collection = connection.client.db('db').collection('sessions') 
 
        collection 
                .find({ 
                        username: {  
                                $regex: user,  
                                $options: 'i'  
                        }, 
                        $or: [{ 
                                holiday: false 
                        }, { 
                                holiday: { 
                                        $exists: false 
                                } 
                        }] 
                }) 
                .sort({ 
                        end: -1 
                }) 
                .skip((pageNo - 1) * N) 
                .limit(N) 
                .toArray(callback);      
}


exports.getUserData = function (req, res) {
	const collection = connection.client.db('db').collection('users');
	const collectionH = connection.client.db('db').collection('holidays');

	async.waterfall([
		function (cb) {
			getUser(req, cb);
		},
		function (user, cb) {
			collection.findOne({
				username: user
			}, cb);
		}, function (result, cb) {
			
			console.log(result);
			collectionH.find({
				username: result.username
			}).toArray(function (err, hdays) {
				if (err) {
					cb(err);
					return;
				}
				console.log(hdays);
				cb(null, {
					user: result,
					holidays: hdays
				});
			})	
			
		}, function (result, cb) {

			getNSessionsSpecificUser(result.user.username, 1, 1, function (err, r) {
				if (err) {
					cb(err);
					return;
				}

				cb(null, {
					...result,
					session: r
				});
			})
		}
	], function (err, result) {
		if (err) {
			res.send({error: err.message});
			return;
		}	

		res.send(result);
		
	});

}


exports.modifySession = function (req, res) {
	const collection = connection.client.db('db').collection('sessions');


	var messageBody = req.body;
	console.log(messageBody);
	async.waterfall([
		function (cb) {
			getUser(req, cb);
		},
		function (user, cb) {

			getNSessionsSpecificUser(user, 1, 1,
				function(error, response) {
					console.log(error);

					var hits = getHitsFromResponse(response);
					if (hits.length >= 0 &&
						hits[0] &&
						hits[0].valid ^ messageBody.active) {
						
						
						cb({error: 'INVALID ACTION'});
						console.log("ERR");
						return;
					}

					if (!messageBody.active && (hits.length == 0 ||
						!hits[0])) {
						
						
						cb({error: 'INVALID ACTION'});
						return;

					}
				
					var id = uuid();
					var start = new Date().getTime();
					var end = start;
					var valid = false;
					if (!messageBody.active) {
						id = hits[0]._id;
						start = hits[0].start;
						valid = true;
					}

					collection.updateOne({
						_id: id
					},{
						$set: {
							"username"	: user,
							"uppercase_username": user.toUpperCase(),
							"start"		: start,
							"end"		: end,
							"valid"		: valid

						}
					}, {
						upsert: true
					}, function(err, resp, status) {
						if (err) {
							console.log(err);
							cb({error: 'MongoDB error'});
							return;
						}
						cb(null);
					});
					
				
				});
		}
	], function (err, response) {
		if (err) {
			res.send({error: err});
			return;

		}
		res.send({success: true});
	});



}

exports.addHoliday = function (req, res) {

	
	const collectionH = connection.client.db('db').collection('holidays');
	const collection = connection.client.db('db').collection('users');
	const collectionS = connection.client.db('db').collection('sessions');
	
	var messageBody = req.body;
	console.log(messageBody);
	let username = null;
	var start = moment(messageBody.start, 'YYYY-MM-DD');
	var end = moment(messageBody.end, 'YYYY-MM-DD');

	var no_of_days = end.businessDiff(start);
	async.waterfall([
		function (cb) {
			getUser(req, cb);
		},
		function (user, cb) {
			username = user;
			collection.updateOne({
				_id: md5(user)
			}, {
				$inc: {
					remaining_holidays: -no_of_days	
				}
			}, cb);
		},
		function (result, cb) {
			start_d = new Date(messageBody.start).getTime();
			end_d = new Date(messageBody.end).getTime();
		
			collectionH.find({
				username: username,
				$or : [
					{
						$and: [{
								end: {
									$lte: end_d
								}
							},
							{	end: {
									$gt: start_d
								}
							}
						]
					},
					{
						$and: [{
								start: {
									$gte: start_d
								}
							},
							{
								start: {
									$lt: end_d
								}
							}
						]
					}
				]
			}).toArray(cb);
		},
		function (result, cb) {
			wrong_date = result.length > 0;
		
			if (wrong_date) {
				collection.updateOne({
					_id: md5(username)
				}, {
					$inc: {
						remaining_holidays: no_of_days	
					}
				}, function () {
					cb({});
				});
				
			} else {
				collectionH.insertOne({
					username: username,
					uppercase_username: username.toUpperCase(),
					start: new Date(messageBody.start).getTime(),
					end: new Date(messageBody.end).getTime()
				}, cb);

			}
			


		}
	], function (err, result) {

		if (err) {
			console.log(err);
			res.send({error: "Something occured. Refresh"});
			return;
		}

		res.send({success: true});

	});
	
}

exports.getTeams = function (req, res) {

	const collectionT= connection.client.db('db').collection('teams');
	collectionT.find().toArray(function (err, result) {
		if (err) {
			res.send({error: 'Somethong occured. Please refresh'});
			return;
		}

		res.send(result);

	});


}
exports.getUsers = function (req, res) {

	const collection = connection.client.db('db').collection('users');
	collection.find().toArray(function (err, result) {
		if (err) {
			res.send({error: 'Somethong occured. Please refresh'});
			return;
		}

		res.send(result);

	});


}
exports.getDept = function (req, res) {

	const collectionD = connection.client.db('db').collection('depts');
	collectionD.find().toArray(function (err, result) {
		if (err) {
			res.send({error: 'Somethong occured. Please refresh'});
			return;
		}

		res.send(result);

	});


}

exports.addTeam = function (req, res) {

	const collection = connection.client.db('db').collection('users');
	const collectionT= connection.client.db('db').collection('teams');

	let messageBody = req.body;
	console.log(messageBody);

	async.waterfall([
		function (cb) {
			getUser(req, cb);
		},
		function (user, cb) {
			collection.findOne({
				username: user
			}, cb);
		}, function (user, cb) {
			console.log(user);	
			if (!user.is_admin) {
				cb({});
				return;
			}
			messageBody.name = messageBody.name.toUpperCase();
			collectionT.updateOne({
				_id: md5(messageBody.name)
			}, {
				$set: {
					name: messageBody.name,
					manager: messageBody.manager,
					dept: messageBody.dept
				}
			}, {
				upsert: true
			}, cb);

		}
	], function (err, response) {
		if (err) {
			res.send({error: "Something occured. Please refresh"});
			return;
		}

		res.send({success: true});

	});


}
exports.addDepartment= function (req, res) {

	const collection = connection.client.db('db').collection('users');
	const collectionD= connection.client.db('db').collection('depts');

	let messageBody = req.body;
	console.log(messageBody);

	async.waterfall([
		function (cb) {
			getUser(req, cb);
		},
		function (user, cb) {
			collection.findOne({
				username: user
			}, cb);
		}, function (user, cb) {
			
			if (!user.is_admin) {
				cb(err);
				return;
			}

			messageBody.name = messageBody.name.toUpperCase();
			collectionD.findOneAndUpdate({
				_id: md5(messageBody.name)
			}, {
				$set: {
					name: messageBody.name,
					manager: messageBody.manager,
					max_holidays_allowed: messageBody.maxHolidaysAllowed
				}
			}, {
				upsert: true
			}, cb);

		},
		function (dept, cb) {
			if (!dept.value) {
				cb(null);
				return;
			}

			console.log(dept.value);
			if (messageBody.maxHolidaysAllowed < dept.value.max_holidays_allowed) {
				cb(null);
				return;
			}
			collection.updateMany({
				dept: dept.value.name
			}, {
				$inc: {
					remaining_holidays: messageBody.maxHolidaysAllowed - dept.value.max_holidays_allowed
				}
			}, cb);

		}
	], function (err, response) {
		if (err) {
			console.log(err);
			res.send({error: "Something occured. Please refresh"});
			return;
		}

		res.send({success: true});

	});


}

