var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
const https = require("https");
const fs = require("fs");
var favicon = require('serve-favicon');
const webpush = require('web-push');

const path = require('path');
const bodyParser = require("body-parser");


//connection.end();

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());


app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/vendor', express.static(path.join(__dirname, 'public', 'vendor')));
app.use('/img', express.static(path.join(__dirname, 'public', 'img')));
app.use('/pwa', express.static(path.join(__dirname, 'public', 'pwa')));
app.use('/html', express.static(path.join(__dirname, 'public', 'html')));
app.use('/sw.js', express.static(path.join(__dirname, 'sw.js')));


app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.ico')));

app.set('view engine', 'ejs');

var subs = [];

// VAPID keys should only be generated only once.
//const vapidKeys = webpush.generateVAPIDKeys();
const vapidKeys = {
	publicKey: 'BDNJ4GGTFcWDLZdNtnkK-sQbs9L1KQd3J9pncDvIA_wcJTXjFtlnuJ9H2V4NXCoPM55eJK_3kCz8Tbz5IMKHIJU',
	privateKey: 'g4VOzWzRpp_WIUNP0H-RcHclIj5HNLa6bGE21N043cA'
}
console.log(vapidKeys);

//webpush.setGCMAPIKey('<Your GCM API Key Here>');
webpush.setVapidDetails(
	'mailto:hyacinthe.menard@ecl19.ec-lyon.fr',
	vapidKeys.publicKey,
	vapidKeys.privateKey
);

app.get('/', function (req, res) {
	//res.sendStatus(200);

	res.status(200).sendFile("html/home.html", { root: "./public" });
});

app.post('/subscribe', (req, res) => {
	console.log('/subscribe');
	console.log(req.body);
	if ((!(JSON.parse(req.body.content) in subs))) {
		subs.push(JSON.parse(req.body.content));
	}
	res.send(req.body);
});

app.post('/broadcast_notif', (req, res) => {
	console.log('/broadcast_notif');
	console.log(req.body);
	console.log(subs);
	subs.forEach(pushSubscription => {
		webpush.sendNotification(pushSubscription, 'Your Push Payload Text');
	});
});

app.get('/autrepage', function (req, res) {
	var html = "<html>"
	html += "<head>"
	html += "<title>Page de formulaire</title>"
	html += "</head>"
	html += "<body>"
	html += "<form action='/formulaire' method='POST'>"
	html += "First Name: <input type='text' name='first_name'> <br>"
	html += "Last Name: <input type='text' name='last_name'> <br>"
	html += "<input type='submit' value='submit'>"
	html += "</form>"
	html += "</body>"
	html += "</html>"

	res.send(html);
});

app.post('/formulaire', function (req, res) {
	response = {
		first_name: req.body.first_name,
		last_name: req.body.last_name
	};
	console.log(response);

	//convert the response in JSON format
	res.end(JSON.stringify(response));
});



app.post('/login', function (req, res) {
	console.log(req.body);
	if (req.body.username == "Eclair" && req.body.password == "password") {
		res.json({ success: true });
	} else {
		res.json({ success: false });
	};
});


var server = https.createServer({ key: fs.readFileSync('ssl/server.key'), cert: fs.readFileSync('ssl/server.crt') }, app);

//app.listen(port);

server.listen(process.env.PORT || 443, () => {
	console.log(`App Started on PORT ${process.env.PORT || 443}`);
});