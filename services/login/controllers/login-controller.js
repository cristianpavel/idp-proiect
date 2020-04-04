var connection = require('../connection.js'); 
var express = require('express')
var md5 = require('md5')
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken');
var config = require('../config.json');

exports.login = function (req, res) {
	const collection = connection.client.db('db').collection('users');

	var messageBody = req.body;
	console.log(messageBody);
	
	console.log(messageBody.username);
	collection.findOne({
		_id: md5(messageBody.username)
	}, function (err, result) {
		console.log(result);	
		if (err) {
			res.send({error: 'Internal server error'});
			return;
		}

		if (!result || !bcrypt.compareSync(messageBody.password, result.password)) {
			res.send({error: 'Incorect username or password'});
			return;
		}



		var token = jwt.sign({id: messageBody.username}, config.secret, {
                        expiresIn: 86400
                });

                res.send({success: true, token: token});

	});
}
