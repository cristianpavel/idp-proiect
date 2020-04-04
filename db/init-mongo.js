
db.createUser({
	user: "admin",
	pwd: "admin123",
	roles: [{
		role: "readWrite",
		db: "db"
	}]
})

db.createCollection('sessions', {
	validator: {
		$expr: {
			$gte: ["$end", "$start"]
		},
		$jsonSchema: {
			bsonType: "object",
			required: ["username", "uppercase_username", "start", "end", "valid"],
			properties: {
				username: {
					bsonType: "string"
				},
				uppercase_username: {
					bsonType: "string"
				},
				valid: {
					bsonType: "bool"
				}
			}
		}
	}
})
db('db').createCollection('users', {
				
	validator: {
		$expr: {
			$gte: ["$remaining_holidays", 0]	
		},
		$jsonSchema: {
			bsonType: "object",
			required: [
				"username",
				"email",
				"password",
				"team",
				"dept",
				"remaining_holidays"
			],
			properties: {
				username: {
					bsonType: "string"
				},
				email: {
					bsonType: "string"
				},
				password: {
					bsonType: "string",
				},
				salt: {
					bsonType: "string"
				},
				team: {
					bsonType: "string"
				},
				dept: {
					bsonType: "string"
				},
				remaining_holidays: {
					bsonType: "int"
				},
				is_admin: {
					bsonType: "bool"
				}
			}
		}
	}

})	

db('db').createCollection('depts', {
	validator: {
		$expr: {
			$gte: ["$max_holidays_allowed", 0]	
		},
		$jsonSchema: {
			bsonType: "object",
			required: ["name",
				"manager",
				"max_holidays_allowed"
			],
			properties: {
				name: {
					bsonType: "string"
				},
				manager: {
					bsonType: "string"
				},
				max_holidays_allowed: {
					bsonType: "int"
				}
			}
		}
	}
})
db('db').createCollection('teams', {
	validator: {
		$jsonSchema: {
			bsonType: "object",
			required: ["name",
				"manager",
				"dept"
			],
			properties: {
				name: {
					bsonType: "string"
				},
				manager: {
					bsonType: "string"
				},
				dept: {
					bsonType: "string"
				}
			}
		}
	}
})
db('db').createCollection('holidays', {
	validator: {
		$expr: {
			$gte: ["$end", "$start"]
		},
		$jsonSchema: {
			bsonType: "object",
			required: ["username",
				"uppercase_username",
				"start",
				"end"
			],
			properties: {
				username: {
					bsonType: "string"
				},
				uppercase_username: {
					bsonType: "string"
				}
			}
		}
	}
})
