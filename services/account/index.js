const express = require('express');
const promBundle = require("express-prom-bundle")
const bodyParser = require('body-parser');
const app = express();
const port = 8080;
const host = '0.0.0.0';
const cors = require('cors')
const metricsMiddleware = promBundle({includeMethod: true});



app.use(metricsMiddleware);
app.use(bodyParser.json());
app.use(cors());

var connection = require('./connection.js');


var registerRouter = require('./routes/register-route.js')
var accountRouter = require('./routes/home-route.js')

app.use('/account', accountRouter);
app.use('/register', registerRouter);


connection.init(function (err, client) {

	if (err) {
		return;
	}

	app.listen(port, host, () => console.log(`App listening on port ${port}!`))

});
