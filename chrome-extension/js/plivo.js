
var plivoClient;

function configure()
{
	var options = {
		"debug":"DEBUG",
		"permOnClick":true,
		"audioConstraints":{"optional":[{"googAutoGainControl":false},{"googEchoCancellation":false}]},
		"enableTracking":true
	};
	plivoClient = new window.Plivo(options);
	plivoClient.client.login("<endpoint_username","<endpoint_password")
}

// End POint Credentaila:
//var username = 'johndoe12345';
//var pass = 'XXXXXXXX';
//plivoBrowserSdk.client.login(username, password);

// plivoClient.client.on('onWebrtcNotSupported', onWebrtcNotSupported);
// plivoClient.client.on('onLogin', onLogin);
// plivoClient.client.on('onLogout', onLogout);
// plivoClient.client.on('onLoginFailed', onLoginFailed);
// plivoClient.client.on('onCallRemoteRinging', onCallRemoteRinging);
// plivoClient.client.on('onIncomingCallCanceled', onIncomingCallCanceled);
// plivoClient.client.on('onCallFailed', onCallFailed);
// plivoClient.client.on('onCallAnswered', onCallAnswered);
// plivoClient.client.on('onCallTerminated', onCallTerminated);
// plivoClient.client.on('onCalling', onCalling);
// plivoClient.client.on('onIncomingCall', onIncomingCall);
// plivoClient.client.on('onMediaPermission', onMediaPermission);
// plivoClient.client.on('mediaMetrics',mediaMetrics);
// plivoClient.client.on('onConnectionChange',onConnectionChange);
