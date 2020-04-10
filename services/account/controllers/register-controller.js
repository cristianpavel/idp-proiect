var connection = require('../connection.js'); 
var express = require('express')
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var md5 = require('md5');
var config = require('../config.json');
var async = require('async');

exports.register = function (req, res) {
	const collection = connection.client.db('db').collection('users');
	const collectionT = connection.client.db('db').collection('teams');
	const collectionD = connection.client.db('db').collection('depts');

	var messageBody = req.body;
	console.log(messageBody);

	var hashedPassword = bcrypt.hashSync(messageBody.password, 8);

	var id = md5(messageBody.username);


	var user = {
		_id: id,
		username: messageBody.username,
		uppercase_username: messageBody.username.toUpperCase(),
		password: hashedPassword,
		email: messageBody.email,
		team: messageBody.team
	};


	async.waterfall([
		function (cb) {
			collectionT.findOne({
				name: messageBody.team
			}, cb);
		},
		function (team, cb) {
			collectionD.findOne({
				name: team.dept
			}, cb);
		}
	], function (err, deptObj) {
		if (err || !deptObj) {
			res.send({error: "The user could not be created. Please try again"});
			return;

		}
		user.dept = deptObj.name;
		user.remaining_holidays = deptObj.max_holidays_allowed;
		collection.insertOne(user, function (err, r) {
			if (err) {
				res.send({error: "The user could not be created. Please try again"});
				return;
			}

			var token = jwt.sign({id: messageBody.username}, config.secret, {
				expiresIn: 86400
			});

			res.send({success: true, token: token});
		});
	});

}

