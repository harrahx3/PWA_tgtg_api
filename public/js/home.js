console.log("home cc");

window.addEventListener('load', () => {
	//registerSW();

	var settings = {
		"url": "https://apptoogoodtogo.com/api/item/v6/",
		"method": "POST",
		"timeout": 0,
		"headers": {
			"Authorization": "Bearer e30.eyJzdWIiOiI5MTczMTI2IiwiZXhwIjoxNjEwMjE2NTI0LCJ0IjoiZXF5S0hveGFUeTJyQVRBMUcycEZSUTowOjEifQ.tGzjxlCA-uTCPIiBGfrq8iVxFK9LwiTAFMeg4-3narg",
			"Content-Type": "jsonp"
		},
		"data": JSON.stringify({ "user_id": "9173126", "origin": { "latitude": 45.75190208790065, "longitude": 4.830272620720394 }, "radius": 30, "page_size": 100, "page": 1, "discover": false, "favorites_only": true, "item_categories": [], "diet_categories": [], "pickup_earliest": null, "pickup_latest": null, "search_phrase": null, "with_stock_only": false, "hidden_only": false, "we_care_only": false }),
	};

	$.ajax(settings).done(function (response) {
		console.log(response);
	});
});

const requestNotificationPermission = async () => {
    const permission = await window.Notification.requestPermission();
    // value of permission can be 'granted', 'default', 'denied'
    // granted: user has accepted the request
    // default: user has dismissed the notification permission popup by clicking on x
    // denied: user has denied the request.
    if(permission !== 'granted'){
        console.log('Permission not granted for Notification');
    } else {
	    console.log("Permission granted for Notification");
    }
}

// Register the Service Worker 
async function registerSW() {
	if ('serviceWorker' in navigator) {
		try {
			navigator
				.serviceWorker
				.register('sw.js', {
					scope: '/'
				}).then(function (reg) {
					reg.pushManager.getSubscription().then(function (sub) {
						console.log('Subscription info : ', sub);
					})
				})
		}
		catch (e) {
			console.log('SW registration failed');
		}
	} else {
		console.log("service workers not supported in navigator");
	}
}

function subscribe() {
	navigator.serviceWorker.getRegistration().then(function (reg) {
		reg.pushManager.subscribe({ userVisibleOnly: true }).then(function (sub) {
			console.log('Update server with subscription object', sub);
			//updateServerReg(sub);
		}).catch(function (error) {
			console.log('unable to subscribe user', error);
		})
	})
}

function unsubscribe() {
	navigator.serviceWorker.getRegistration().then(function (reg) {
		reg.pushManager.subscribe({ userVisibleOnly: true }).then(function (sub) {
			if (sub) {
				console.log('Update server to remove sub', sub);
				sub.unsubscribe();
			}
		}).catch(function (error) {
			console.log('unable to unsubscribe user', error);
		})
	})
}


function urlBase64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding)
		.replace(/-/g, '+')
		.replace(/_/g, '/');

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}



async function triggerPushNotificationSubscription() {
	if ('serviceWorker' in navigator) {
		const register = await navigator.serviceWorker.register('/sw.js', {
			scope: '/'
		});
		const publicVapidKey = 'BDNJ4GGTFcWDLZdNtnkK-sQbs9L1KQd3J9pncDvIA_wcJTXjFtlnuJ9H2V4NXCoPM55eJK_3kCz8Tbz5IMKHIJU';

		const subscription = await register.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
		});

		$.post('/subscribe', {
			content: JSON.stringify(subscription)
		});
		//https://192.168.1.31/
		// broadcastPushNotification();

		/*await fetch('module/aqh/subscribe', {
		  method: 'POST',
		  body: JSON.stringify(subscription),
		  headers: {
			'Content-Type': 'application/json',
		  },
		});*/
	} else {
		console.error('Service workers are not supported in this browser');
	}
}


async function broadcastPushNotification(msg) {
	/*  await fetch('module/aqh/broadcast_notif', {
		method: 'GET'
	  });*/
	$.post('/broadcast_notif', { title: msg });
}

$(function () {
	console.log("DOM ready");
	requestNotificationPermission();
	registerSW();
	triggerPushNotificationSubscription();
	//broadcastPushNotification("my msg");
})
