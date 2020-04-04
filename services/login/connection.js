const mongodb = require('mongodb').MongoClient;
const url = 'mongodb://db:27017'

globalClient = null;

function init(callback) {
	mongodb.connect(url, {
 		useNewUrlParser: true,
    		useUnifiedTopology: true
  	}, (err, client) => {
  		if (err) {
    			console.error(err)
    			callback(err);
  			return;
		}
		console.log("Connected to db");	
		module.exports.client = client;
		callback(null);
		return;
	});
}


module.exports = {};

module.exports.init = init;
