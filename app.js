var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
const http = require("http");
const https = require("https");
const fs = require("fs");
var favicon = require('serve-favicon');
const webpush = require('web-push');
const path = require('path');
const bodyParser = require("body-parser");
var request = require('request');
//const os = require('os');


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


// VAPID keys should only be generated only once.
//const vapidKeys = webpush.generateVAPIDKeys();
const vapidKeys = {
	publicKey: 'BDNJ4GGTFcWDLZdNtnkK-sQbs9L1KQd3J9pncDvIA_wcJTXjFtlnuJ9H2V4NXCoPM55eJK_3kCz8Tbz5IMKHIJU',
	privateKey: 'g4VOzWzRpp_WIUNP0H-RcHclIj5HNLa6bGE21N043cA'
}
console.log("vapidKeys:\n" + vapidKeys + '\n');

//webpush.setGCMAPIKey('<Your GCM API Key Here>');
webpush.setVapidDetails(
	'mailto:hyacinthe.menard@ecl19.ec-lyon.fr',
	vapidKeys.publicKey,
	vapidKeys.privateKey
);


var subs = [];
var tokens = {
	access_token: "e30.eyJzdWIiOiI5MTczMTI2IiwiZXhwIjoxNjEwNjE2MDMxLCJ0IjoiaHU2TW01MjBUMVN5UThOVXIybV8xZzowOjEifQ.P8S9yxcFCOIf_rg91xDt1GJUpmcypCTYHXFWyrMZNuc_",
	refresh_token: "e30.eyJzdWIiOiI5MTczMTI2IiwiZXhwIjoxNjQxOTc5MjMxLCJ0IjoiR3lSNHIyd2xTUzZNWkZ5RHVZSWpTQTowOjAifQ.g9PzyyO9ogdL-I5F-riPgYS6NiYLC2Q3sUJ2RbkHe_0"
};
var already_pomponette = false;


// read subs JSON object from subs.json file
fs.readFile('subs.json', 'utf-8', (err, data) => {
	if (err) {
		console.error(err);
	}
	subs = JSON.parse(data.toString());

	console.log("subs from subs.json: ")
	console.log(subs);
});

// read subs JSON object from subs.json file
fs.readFile('tokens.json', 'utf-8', (err, data) => {
	if (err) {
		console.error(err);
	}
	tokens = JSON.parse(data.toString());

	console.log("tokens from tokens.json: ")
	console.log(tokens);
});

function refresh_token(old_refresh_token) {
	return new Promise((resolve, reject) => {
		var options = {
			'method': 'POST',
			'url': 'https://apptoogoodtogo.com/api/auth/v1/token/refresh',
			'headers': {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ "refresh_token": old_refresh_token })
		};
		request(options, function (error, response) {
			console.log('\n refresh token');
			console.log(Date());
			console.log('\n');
			if (error) console.error(error);//throw new Error(error);
			console.log(response.body.substring(0, 300));
			resolve(response.body);
		});
	})

}

function fetch_favorite(access_token) {
	return new Promise((resolve, reject) => {
		var options = {
			'method': 'POST',
			'url': 'https://apptoogoodtogo.com/api/item/v6/',
			'headers': {
				'Authorization': 'Bearer ' + access_token,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ "user_id": "9173126", "origin": { "latitude": 45.75190208790065, "longitude": 4.830272620720394 }, "radius": 30, "page_size": 100, "page": 1, "discover": false, "favorites_only": true, "item_categories": [], "diet_categories": [], "pickup_earliest": null, "pickup_latest": null, "search_phrase": null, "with_stock_only": false, "hidden_only": false, "we_care_only": false })

		};
		request(options, function (error, response) {
			console.log('\n access favorite https://apptoogoodtogo.com/api/item/v6/');
			console.log(Date());
			console.log('\n');
			if (error) {
				console.error(error);
				reject(error);
			} else {//throw new Error(error);
				console.log(response.body.substring(0, 200));
				resolve(response.body);
			}
		});
	})
}


async function fetch_and_notif_fav() {
	console.log('\n' + Date() + '\n');

	var response = await fetch_favorite(tokens.access_token)
		.then(JSON.parse)
		.then(function (rep) {
			console.log("fav: " + rep);
			//if (rep.items) {
			return rep;
			//}
		})
		.catch((error) => {
			console.error('Promise catch error:');
			console.error(error);
			return;
		});

	console.log('\nitems:\n' + response);
	//console.log(items.length);
	//console.log(items[0]);
	//console.log(items[0].display_name);

	stores_available = "";
	if (response.items) {
		var items = response.items;
		for (let index = 0; index < items.length; index++) {
			const store = items[index];
			console.log(store.item.item_id + " : " + store.display_name + " => " + store.items_available);
			if (store.items_available) {
				stores_available = stores_available + "; " + store.display_name;
				if (store.display_name.split(" ")[0] == "Pomponette") {
					if (!already_pomponette) {
						subs.forEach(pushSubscription => {
							webpush.sendNotification(pushSubscription, JSON.stringify({ title: 'fav tgtg available', body: "Panier Pomponette à sg !" }));
						});
					}
				}
			}
			already_pomponette = (store.item_id==60978) ? Boolean(store.items_available) : already_pomponette;
		}
	} else if (response.status && response.status == 401) {
		console.log("erreur 401 !");
		subs.forEach(pushSubscription => {
			webpush.sendNotification(pushSubscription, JSON.stringify({ title: 'tgtg error !', body: response.message }));
		});

		var new_tokens = await refresh_token(tokens.refresh_token)
			.then(JSON.parse)
			.then(function (new_tokens) {
				tokens = new_tokens;
				console.log("\n changed tokens:\n" + new_tokens);
				const data = JSON.stringify(new_tokens);
				// write JSON string to a file
				fs.writeFile('tokens.json', data, (err) => {
					if (err) {
						console.error(err);
					}
					console.log("tokens JSON data is saved.");
				});
				return new_tokens;
			})
			.catch((error) => {
				console.error(error);
				return;
			});
	}
}

function repeat() {
	var now = new Date();
	if (now.getHours() > 8) {
		fetch_and_notif_fav();
	}
	setTimeout(repeat, (Math.random() * 20 + 15) * 60 * 1000);
}
setTimeout(repeat, .2 * 60 * 1000);
//setInterval(fetch_and_notif_fav, .3 * 60 * 1000, tokens);


app.get('/', function (req, res) {
	res.status(200).sendFile("html/home.html", { root: "./public" });
});

app.post('/subscribe', (req, res) => {
	console.log('/subscribe');
	console.log(req.body);
	var addsub = true;
	if (req.body.content) {
		subs.forEach(sub => {
			if (JSON.stringify(sub) == req.body.content) {
				addsub = false;
			}
		});
		if (addsub) { // ajoute l'objet {endpoint:"", keys: {auth: "", p256dh: ""}} à subs et au fichier sub.json si il est non null et pas déjà abonné
			subs.push(JSON.parse(req.body.content));

			// convert JSON object to string
			const data = JSON.stringify(subs);
			// write JSON string to a file
			fs.writeFile('subs.json', data, (err) => {
				if (err) {
					throw err;
				}
				console.log("subs JSON data is saved.");
			});
		}
	}
	res.send(req.body);
});


// ****** Inutile ******

app.post('/broadcast_notif', (req, res) => {
	console.log('/broadcast_notif');
	console.log(req.body);
	console.log(subs);
	subs.forEach(pushSubscription => {
		webpush.sendNotification(pushSubscription, JSON.stringify({ title: "tgtg broadcast notif", body: "broadcast notif" }));
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
//var server = http.createServer(app);

//app.listen(port);

server.listen(process.env.PORT || 443, () => {
	console.log(`App Started on PORT ${process.env.PORT || 443}`);
});

// redirect HTTP server
//const httpApp = express();
//httpApp.all('*', (req, res) => res.redirect(300, 'https://109.26.17.52:4443'));
//const httpServer = http.createServer(httpApp);
//httpServer.listen(80, () => console.log('HTTP server listening: http://109.26.17.52'));


/*
fetch_tgtg_fav = function () {

	var now = new Date();

	if (now.getHours() < 9) {
		return
	}

	var options = {
		'method': 'POST',
		'hostname': 'apptoogoodtogo.com',
		'path': '/api/item/v6/',
		'headers': {
			'Authorization': 'Bearer e30.eyJzdWIiOiI5MTczMTI2IiwiZXhwIjoxNjEwMjE2NTI0LCJ0IjoiZXF5S0hveGFUeTJyQVRBMUcycEZSUTowOjEifQ.tGzjxlCA-uTCPIiBGfrq8iVxFK9LwiTAFMeg4-3narg',
			'Content-Type': 'application/json'
		},
		'maxRedirects': 20
	};

	var req = https.request(options, function (res) {
		var chunks = [];

		res.on("data", function (chunk) {
			chunks.push(chunk);
		});

		res.on("end", function (chunk) {
			var body = Buffer.concat(chunks);
			//console.log(body.toString());
			items = JSON.parse(body.toString()).items;
			//console.log(items[0].display_name);
			stores_available = "";
			console.log(Date());
			for (let index = 0; index < items.length; index++) {
				const store = items[index];
				console.log(store.display_name + " => " + store.items_available);
				if (store.items_available) {
					stores_available = stores_available + "; " + store.display_name;
					if (store.display_name.split(" ")[0] == "Pomponette") {
						subs.forEach(pushSubscription => {
							webpush.sendNotification(pushSubscription, JSON.stringify({ title: 'fav tgtg available', body: "Panier Pomponette à sg !" }));
						});
					}
				}
			}

		});

		res.on("error", function (error) {
			console.error(error);
		});
	});

	var postData = JSON.stringify({ "user_id": "9173126", "origin": { "latitude": 45.75190208790065, "longitude": 4.830272620720394 }, "radius": 30, "page_size": 100, "page": 1, "discover": false, "favorites_only": true, "item_categories": [], "diet_categories": [], "pickup_earliest": null, "pickup_latest": null, "search_phrase": null, "with_stock_only": false, "hidden_only": false, "we_care_only": false });

	req.write(postData);

	req.end();
}

setInterval(fetch_tgtg_fav, 20 * 60 * 1000);
*/
