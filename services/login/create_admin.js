var connection = require('./connection.js'); 
var bcrypt = require('bcryptjs');
var md5 = require('md5');
var config = require('./config.json');

connection.init(function (err) {
	if (err) {
		return;
	}
	const collection = connection.client.db('db').collection('users');

	var id = md5('admin');
	var user = {
		_id: id,
		username: 'admin',
		password: bcrypt.hashSync('admin', 8),
		email: 'NONE',
		team: 'ADMIN',
		dept: 'ADMIN',
		remaining_holidays: 100,
		is_admin: true
	}



	collection.insertOne(user, function (err, res) {
		if (err) {
			return;
		}


		console.log({success: true});
	});
})

