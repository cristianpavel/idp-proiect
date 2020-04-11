var connection  = require('../connection.js');

module.exports = function getNSessionsSpecificUser(user, N, pageNo, callback) {
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
