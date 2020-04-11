
var connection = require('../connection.js');
var getNSessionsSpecificUser = require('./get-sessions.js');


var getDurationTimeRange = function getDurationTimeRange(user, from, to, callback) {

	const collection = connection.client.db('db').collection('sessions');
        collection.aggregate(
                [
                        {
                                $match: {
                                        $and: [{
						valid: true
						},
						{
							username: user
						}, {
							end: {
								$gt: from,
								$lt: to
							}
						}
					]
                                }
                        },
                        {
                                $group: {
					_id: {
						$dateToString: {
							format: "%Y-%m-%d",
							date: {
								$toDate: "$end" 
							}
						}
					},
                                        total: {
                                                $sum: {
							$subtract: ["$end", "$start"]
						}
                                        }
                                }
                        }
                ]).toArray(callback);


}


var getAverageSessionDurationSpecificUser = function getAverageSessionDuratonSpecificUser(user, callback) {


	const collection = connection.client.db('db').collection('sessions');
        collection.aggregate(
                [
                        {
                                $match: {
                                        $and: [{
						valid: true
						},
						{
							username: user
						}
					]
                                }
                        },
                        {
                                $group: {
					_id: null,
					avgSession: {
                                                $avg: {
                                                        $subtract: ["$end", "$start"]
                                                }
                                        }
                                }
                        }
                ]).toArray(callback);



}

exports.getSessions = function (req, res) {

	var messageBody = req.body;
	console.log(messageBody);
	console.log("Get Sessions");
	getNSessionsSpecificUser(messageBody.username,
				Number(messageBody.noSessions),
				Number(messageBody.pageNo),
				function(err, response, status) {
					if (err) {
						return;
					}
					console.log(response);
					res.send(response);
				});
}

exports.getAverage = function (req, res) {


	var messageBody = req.body;
	var average;
	console.log("Get Average");
	getAverageSessionDurationSpecificUser(messageBody.username,
			function(err, response) {
				console.log(err);
				if (err || !response[0]) {
					return;
				}
				
				res.send({

					avg: response[0].avgSession
				});
			});



}

exports.getDateHistogram = function (req, res) {

	var messageBody = req.body;
	console.log(messageBody);
	var duration_per_day = [];
	getDurationTimeRange(messageBody.username, messageBody.from,
		messageBody.to,
		function (err, response) {

			if (!response || err) {
				console.log(err);
				return;
			}

			console.log(response);


			var buckets = response;

			if (!buckets || !buckets.length) {
				console.log("No buckets");
				res.send(duration_per_day);
				return;
			}

			buckets.forEach(function(bucket) {
				var day = bucket._id;
				var value = bucket.total;

				duration_per_day.push({
					day: day,
					value: value
				});
			});

			console.log(duration_per_day);
			res.send(duration_per_day);

		});



};
