var https = require('https');
var querystring = require('querystring');
var express = require('express');
const bodyParser = require("body-parser");
var parse = require('date-fns/parse')


const app = express()

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(express.static('public'));

function request(data, callback) {
	var path='/v1/payments';

	var options = {
		port: 443,
		host: 'test.oppwa.com',
		path: path,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': data.length
		}
	};
	var postRequest = https.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			jsonRes = JSON.parse(chunk);
			return callback(jsonRes);
		});
	});
	postRequest.write(data);
	postRequest.end();
}


function formatDate(timestamp) {
	const date = new Date(timestamp);
	const hours = date.getHours();
	const minutes = "0" + date.getMinutes();
	const seconds = "0" + date.getSeconds();
	return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
}

app.get('/', (req, res) => {
	res.render('pages/index')
})

app.post("/", (req, res) => {
	var data = querystring.stringify( {
		'authentication.userId':'8a8294175d602369015d73bf00e5180c',
		'authentication.password':'dMq5MaTD5r',
		'authentication.entityId':'8a8294175d602369015d73bf009f1808',
		'amount': req.body.amount,
		'currency': req.body.currency,
		'paymentBrand': req.body.paymentBrand,
		'paymentType':'DB',
		'card.number': req.body.cardNumber,
		'card.holder': req.body.cardHolder,
		'card.expiryMonth': req.body.expiryMonth,
		'card.expiryYear': req.body.expiryYear,
		'card.cvv': req.body.cvv
	});

	request(data, function(responseData) {
		if(responseData) {
			res.status(200).json({
				message: responseData.result.description,
				amount: responseData.amount,
				timestamp: formatDate(responseData.timestamp)
			});
		} else {
			res.status(400).json({
				message: 'Something went wrong'
			});
		}
	});
})

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
})
