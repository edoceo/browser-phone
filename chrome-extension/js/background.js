/**
	Background Operator
*/

'use strict';


// These are all exposed to the Options and Popup pages from the BGP object

var Color = {
	Red: [255, 0, 0, 192],
	Orange: [255, 116, 0, 192], // [255, 133, 0, 192]
	Green: [0, 192, 0, 192],
	Grey: [56, 56, 56, 56],
};

//function modeFail()
//{
//}

function getData(k)
{
	return localStorage.getItem(k);
}

function setData(k, v)
{
	return localStorage.setItem(k, v);
}

/**
	Answer the Call
*/
function callAnswer()
{
	twilioChannel.want++;
	twilioChannel.accept(); // no return value

	if (twilioChannel.want >= 2) {
		ctp.stat('fail', Color.Red, 'Cannot Accept; likely due to Media Permissions');
		return false;
	}

	return true;

}

function callIgnore()
{
	twilioChannel.want = -1;
	twilioChannel.ignore();

	ctp.stat('drop', Color.Grey, 'Ignored');
	setTimeout(function() {
		ctp.init();
	}, 500);

	return true;

}

//
var _app = 'VBX Browser Phone';
//var l = function(x) { if (window.console) console.log(x); };

var ctp = {

	w: 2100, // Wait Time after some Event
	ec:0, // Error Count

	call: function (s, d)
	{
		twilioChannel = Twilio.Device.connect({
			From: s,
			To: d
		});
	},

	// Loading
	init: function ()
	{
		if (!localStorage.call_dial_last) localStorage.call_dial_last = '';
		if (!localStorage.call_text_last) localStorage.call_text_last = '';

		if ('good' != localStorage.getItem('mic-access')) {
			ctp.stat('conf', Color.Red, 'Configure Audio Permissions');
			return(false);
		}

		// Check Access
		if ((!localStorage._user_sid) || (!localStorage._auth_tid)) {
			ctp.stat('auth', Color.Red, 'Configure Authorization');
			return(false);
		}

		ctp.stat('init', Color.Grey, 'connecting');

		this.getApplicationList();
		this.getNumberList();

		// Check Client Name
		if (!localStorage._plug_did) {
			ctp.stat('name', Color.Red, 'Configure Client Name');
			localStorage._option_warn = 'Configure a Twilio Client Name';
			return(false);
		}

		// Check Outgoing Application
		if (!localStorage._prog_sid) {
			ctp.stat('prog', Color.Red, 'Configure TwiML Application');
			localStorage._option_warn = 'Configure an Outgoing TwiML Application';
			return(false);
		}


		// Web Token Request
		var wtr = {};
		wtr.scope = 'scope:client:outgoing?appSid=' + localStorage._prog_sid + '&appParams=&clientName=' + localStorage._plug_did + ' scope:client:incoming?clientName=' + localStorage._plug_did;
		wtr.iss = localStorage._user_sid;
		wtr.exp = Math.round(new Date().getTime() / 1000) + 3600; // Now + 1 Hour

		var tok = new jwt.WebToken(JSON.stringify(wtr), JSON.stringify({typ: 'JWT', alg: 'HS256'}));
		twilioSession.token = tok.serialize(localStorage._auth_tid);

		var td = Twilio.Device.setup(twilioSession.token, {
			debug: true
		});

		var s = Twilio.Device.status();
		console.log('ctp.init status = ' + s);

		switch (s) {
		case 'ready':
			ctp.stat('idle', Color.Green, 'Ready');
			break;
		default:
			ctp.stat('init', Color.Orange, s);
			break;
		};

	},

	/**

	*/
	kill: function ()
	{
		if (twilioChannel) {
			twilioChannel.disconnect();
			twilioChannel = null;
		}
		Twilio.Device.disconnectAll();
	},

//	move: function () {
//		$.post('http://api.twilio.com/2010-04-01/Accounts/{account_sid}/Calls/{call_sid}',
//			{'Url': 'https://app-uri/twiml'},
//			function(ret, xhr, res) {
//				alert(ret);
//			}
//		);
//	},

	/**
		Change Button Status
	*/
	stat: function (n, c, t) // Note, Colour, Info Text
	{
		//l('ctp.stat(' + n + ',' + c + ',' + t + ')');

		if (!t) {
			t = '';
		}

		chrome.browserAction.setTitle({
			title: t
		});
		chrome.browserAction.setBadgeText({
			text: n
		});
		chrome.browserAction.setBadgeBackgroundColor({
			color: c
		});

		//chrome.browserAction.setIcon({
		//	path: "img/phone-idle.png",
		//});
	},

	/**

	*/
	logs_list: function(cb) {
		var u = 'https://' + localStorage._user_sid + ':' + localStorage._auth_tid + '@api.twilio.com/2010-04-01/Accounts/' + localStorage._user_sid + '/Notifications.json?Page=0&PageSize=10';
		console.log('ctp.post(' + u + ')');
		$.get(u,cb);
	},

	/**
		@param s Source Number
		@param d Target Number
		@param t Text to Send
		@param cb Callback Function
	*/
	text: function(s,d,t,cb)
	{
		$.ajax({
			type: 'POST',
			url: 'https://api.twilio.com/2010-04-01/Accounts/' + localStorage._user_sid + '/SMS/Messages.json',
			data: {
				From: s,
				To: d,
				Body: t
			},
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authorization", "Basic " + btoa(localStorage._user_sid + ':' + localStorage._auth_tid));
			},
			success: function(body, stat) {

			},
			complete: cb,
		});
	},

	/**
		@param cb callback function
	*/
	text_list: function(cb)
	{
		// var u = 'https://' + localStorage._user_sid + ':' + localStorage._auth_tid + '@api.twilio.com/2010-04-01/Accounts/' + localStorage._user_sid + '/SMS/Messages.json';
		// u += '?Page=0&PageSize=10';
		// window.console && console.log('ctp.text_list(' + u + ')');
		// $.get(u,cb);

		// Actual Numbers
		var xhr = $.ajax({
			type: 'GET',
			url: 'https://api.twilio.com/2010-04-01/Accounts/' + localStorage._user_sid + '/SMS/Messages.json?Page=0&PageSize=20',
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authorization", "Basic " + btoa(localStorage._user_sid + ':' + localStorage._auth_tid));
			},
			success: cb
		});

		// function(body, stat) {
		// 	var sms_list = body.applications;
		// 	var idx = 0;
		// 	var max = app_list.length;
		// 	for (idx = 0; idx<max; idx++) {
		// 		ApplicationList.push(app_list[idx]);
		// 	}
		// }
	},

	/**
	 * Fetches the IncomingNumbers from Twilio to populate the outgoing caller id list
	 * @return void
	 */
	getApplicationList()
	{
		ApplicationList = [];

		// Applications
		var xhr = $.ajax({
			type: 'GET',
			url: 'https://api.twilio.com/2010-04-01/Accounts/' + localStorage._user_sid + '/Applications.json',
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authorization", "Basic " + btoa(localStorage._user_sid + ':' + localStorage._auth_tid));
			},
			success: function(body, stat) {
				var app_list = body.applications;
				var idx = 0;
				var max = app_list.length;
				for (idx = 0; idx<max; idx++) {
					ApplicationList.push(app_list[idx]);
				}
			}
		});

	},

	/**
	 * Fetches the IncomingNumbers from Twilio to populate the outgoing caller id list
	 * @return void
	 */
	getNumberList()
	{
		NumberList = [];

		// Actual Numbers
		var xhr = $.ajax({
			type: 'GET',
			url: 'https://api.twilio.com/2010-04-01/Accounts/' + localStorage._user_sid + '/IncomingPhoneNumbers.json',
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authorization", "Basic " + btoa(localStorage._user_sid + ':' + localStorage._auth_tid));
			},
			success: function(body, stat) {
				var num_list = body.incoming_phone_numbers;
				var idx = 0;
				var max = num_list.length;
				for (idx = 0; idx<max; idx++) {
					NumberList.push({
						nice: num_list[idx].friendly_name,
						e164: num_list[idx].phone_number
					});
				}
			}
		});

		// Outgoing Caller IDs
		var xhr = $.ajax({
			type: 'GET',
			url: 'https://api.twilio.com/2010-04-01/Accounts/' + localStorage._user_sid + '/OutgoingCallerIds.json',
			beforeSend: function (xhr) {
				xhr.setRequestHeader ("Authorization", "Basic " + btoa(localStorage._user_sid + ':' + localStorage._auth_tid));
			},
			success: function(body, stat) {
				var num_list = body.outgoing_caller_ids;
				var idx = 0;
				var max = num_list.length;
				for (idx = 0; idx<max; idx++) {
					NumberList.push({
						nice: num_list[idx].friendly_name + ' - Outgoing',
						e164: num_list[idx].phone_number
					});
				}
			}
		});

	}
};

/**
	Prompt for Options or the Popup if set properly
*/
// chrome.browserAction.onClicked.addListener(function(tab) {
//
// 	//if ('good' != localStorage.getItem('mic-access')) {
// 	var arg = {
// 		url: 'options.html'
// 	};
//
// 	chrome.tabs.create(arg);
//
// 	//} else {
// 	//	chrome.browserAction.setPopup({
// 	//		popup: "popup.html"
// 	//	});
// 	//}
//
// });


// Init my Thing
document.addEventListener("DOMContentLoaded", function () {

	console.log('BrowserPhone!DOMContentLoaded');

	ctp.init();

	// Ready Handler
	Twilio.Device.on('ready', function(d) {
		console.log('Twilio.Device.ready(' + d + ')');
		ctp.stat('idle', Color.Green, 'Online');
	});

	// Incoming
	Twilio.Device.on('incoming', function (x) {

		console.log('Twilio.Device.incoming()');
		twilioChannel = x;
		twilioChannel.want = 0;
		ctp.stat('ring', Color.Red, 'From: ' + twilioChannel.parameters.From);

	});

	// Connected
	Twilio.Device.on('connect', function (c) {

		console.log('Twilio.Device.connect()');

		ctp.stat('talk', Color.Orange, c.parameters.From);

		// Open the Requested Page
		var url = localStorage.getItem('_open_url');
		if ((undefined !== url) && (url.length > 5)) {
			url = url.replace('{PHONE}', c.parameters.From);
			chrome.tabs.create({
				url: url,
			});
		}

	});

	// Disconnected
	Twilio.Device.on('disconnect', function (x) {

		console.log('Twilio.Device.disconnect()');

		ctp.stat('done', Color.Grey);

		window.setTimeout(function() {
			ctp.init();
		}, 1);

	});

	// Cancel - incoming twilioChannel is canceled by the caller before it is accepted
	Twilio.Device.on('cancel', function(x) {

		console.log('Twilio.Device.cancel()');
		ctp.kill();
		ctp.stat('drop', Color.Red);
		window.setTimeout(function() {
			ctp.init();
		}, 1);

	});

//	// Offline Event
//	Twilio.Device.offline(function() {
//		l('Twilio.Device.offline()');
//		ctp.kill();
//		ctp.stat('...',[56, 56, 56, 128]);
//	});

	/**
		Token has expired => Make a new one
	*/
	Twilio.Device.on('error', function (e) {

		console.log('Twilio.Device.error(' + e.message + ')');

		ctp.kill();
		ctp.stat('fail', Color.Red,e.message);

		twilioChannel = null;
		twilioSession.token = null;

		// window.setTimeout(function() {
		// 	ctp.init();
		// }, 2000);

	});
});

// What is all this about?

var cmp = {
	type: 'normal',
	title: 'Browser Phone',
	enabled: true,
	visible: true,
	contexts: [ 'link', 'selection' ],
	// targetUrlPatterns: [ '^tel:', '^callto:' ], // these schemes are not allowed anyway :(
	onclick: function(ocd, tab) {
		if (ocd.linkUrl) {
			debugger;
			if ('tel://' === ocd.linkUrl.substr(0, 6)) {
				var num = ocd.linkUrl.substr(6);
				setData('call_dial_last', num);
				ctp.stat('call', Color.Blue);
				//chrome.runtime.sendMessage(null, { 'target': num }, function() { /* What? */ });
			}
		}

		if (ocd.selectionText) {
			// Copy Text to Popup
			//chrome.runtime.sendMessage(null, { 'target': num }, function() { /* What? */ });
			setData('call_dial_last', num);
			ctp.stat('call', Color.Blue);
		}

	}
};

console.log('cmp');

// Add Context Menu Items
chrome.contextMenus.create(cmp, function() {
	if (chrome.extension.lastError) {
		ctp.stat('fail', Color.Red);
		//chrome.browserAction.setTitle({title: chrome.extension.lastError});
	}
});
