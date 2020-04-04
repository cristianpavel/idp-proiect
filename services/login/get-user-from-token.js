const jwt = require('jsonwebtoken');
const config = require('./config');


function getUser(req, callback) { 
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

module.exports = getUser;
