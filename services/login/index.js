const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8080;
const host = '0.0.0.0';
const cors = require('cors')

app.use(bodyParser.json());
app.use(cors());

var connection = require('./connection.js');


var loginRouter = require('./routes/login-route.js')

app.use('/login', loginRouter);

connection.init(function (err, client) {

	if (err) {
		return;
	}

	app.listen(port, host, () => console.log(`App listening on port ${port}!`))

});
