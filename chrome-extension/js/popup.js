/**
	This is run every time the popup becomes visible
*/

var bgp = chrome.extension.getBackgroundPage();


chrome.runtime.onMessage.addListener(function(msg) {

	$('#outgoing-target').val( msg.target );

});


chrome.runtime.onMessageExternal.addListener(function(msg) {

	$('#outgoing-target').val( msg.target );

});


// Init my Thing
document.addEventListener("DOMContentLoaded", function () {

	$('#btn-configure').on('click', function() {
		chrome.runtime.openOptionsPage();
	});

	if (bgp.NumberList) {
		if (bgp.NumberList.length > 0) {

			$('#outgoing-number-list').empty();

			bgp.NumberList.forEach(function(v) {
				$('#outgoing-number-list').append('<option value="' + v.e164 + '">' + v.nice + '</option>')
			});

			// Set MRU
			$('#outgoing-number-list').val(bgp.getData('outgoing-source'))
		}
	}

	$('#outgoing-target').val( bgp.getData('call_dial_last') );

	$('#_ctp_call_call').on('click',function() {

		var source = $('#outgoing-number-list').val();
		var target = $('#outgoing-target').val();
		bgp.ctp.call(source, target);

		bgp.setData('outgoing-source', source);
		bgp.setData('call_dial_last', target);

		$('#outgoing-call-stop').removeAttr('disabled');
	});

	$('#outgoing-call-stop').on('click',function() {
		$('#outgoing-call-stop').attr('disabled', 'disabled');
		bgp.ctp.kill();
		window.close();
	});

	$('#_ctp_text_send').on('click',function() {

		var source = $('#outgoing-number-list').val();
		var target = $('#outgoing-target').val();
		var txt = $('#_ctp_text_body').val();

		$('#_ctp_text_send').attr('disabled',true);
		$('#_ctp_info').html('Sending...');

		bgp.ctp.text(source, target, txt, function() {
			$('#_ctp_info').html('Text Sent');
			$('#_ctp_text_text').val('');
			$('#_ctp_text_send').removeAttr('disabled');
			window.close();
		});

		bgp.setData('outgoing-source', source);

	});

	$('#_ctp_text_list').on('click',function() {
		$('#_ctp_info').html('Loading...');
		$('#outgoing-call-form').hide();
		$('#outgoing-text-form').hide();
		$('#_ctp_text_send').attr('disabled',true);
		bgp.ctp.text_list(function(res,ret,jhr) {
			var h = '';
			if (res.sms_messages) {
				for (var i in res.sms_messages) {
					var m = res.sms_messages[i];
					h += '<div class="mb-1">';
					h += '<div><strong>' + m.from + '</strong> =&gt; ' + m.to + '</div>';
					h += '<div>' + m.body + '</div>';
					h += '<div>(R)</div>'
					h += '</div>';
				}
			}
			$('#_ctp_info').hide();
			$('#outgoing-text-form').html(h);
			$('#outgoing-text-form').show();
		});
	});

	$('#logs-list').on('click',function() {
		$('#_ctp_info').html('Loading...');
		$('#outgoing-call-form').hide();
		$('#outgoing-text-form').hide();
		bgp.ctp.logs_list(function(res,ret,jhr) {
			if (res.notifications) {
				var h = '<table style="width:600px;">';
				for (var i in res.notifications) {
					var m = res.notifications[i];
					h += '<tr><td>' + m.message_date + '</td><td>' + m.request_url + '</td></tr>';

					h += '<tr><td colspan="2">';
					var a = m.message_text.split('&');
					for (var i = 0; i < a.length; i++) {
						var pair = a[i].split('=');
						// h += pair[0] + ', ';
						if (pair[0] == 'Msg') h+= decodeURI(pair[1]).replace(/\+/g,' ');
						if (pair[0] == 'parserMessage') h+= decodeURI(pair[1]).replace(/\+/g,' ');
					}
					// h += '<tr><td colspan="3">' + m.message_text + '</td></tr>';
					h += '</td></tr>';
				}
				h += '</table>';
			}
			$('#_ctp_info').hide();
			$('#outgoing-text-form').html(h);
			$('#outgoing-text-form').show();
		});

	});

	// @todo should be Phone.status();
	var s = 'conf';
	try {
		s = bgp.Twilio.Device.status();
		if (bgp.twilioChannel) {
			s += '/' + bgp.twilioChannel.status();
		}
	} catch (e) {
		// Ignore
	}
	console.log('Popup Status: ' + s);

	$('#status').html('-' + s + '-');

	switch (s) {
	case 'ready':
	case 'ready/closed':

		$('#status').html('Ready');
		$('#incoming-form').hide();
		$('#outgoing-call-form').show();
		$('#outgoing-text-form').show();
		$('#outgoing-number-grid').hide();

		break;

	case 'ready/pending':

		$('#status').html('Ring! Ring!');
		$('#incoming-form').show();
		$('#outgoing-call-form').hide();
		$('#outgoing-text-form').hide();

		var url = bgp.getData('_open_url');
		if ((undefined !== url) && (url.length > 5)) {
			url = url.replace('{PHONE}', bgp.twilioChannel.parameters.From);
			$('#_take_link').attr('href', url);
			$('#_take_link').text(bgp.twilioChannel.parameters.From);
		}

		$('#call-answer').on('click',function() {
			console.log('take-call-click');
			bgp.callAnswer();
			window.close();
		});

		$('#call-ignore').on('click',function() {
			bgp.callIgnore();
			window.close();
		});

		break;

	case 'busy': // In Call

		$('#info').html('Talk: ' + bgp.ctp.twilioChannel.parameters.To);
		$('#outgoing-call-form').hide();
		$('#outgoing-text-form').hide();
		$('#outgoing-number-grid').show();

	case 'busy/open': // In Call
		$('#status').html('On Call');
		$('#outgoing-call-form').hide();
		$('#outgoing-text-form').hide();
		$('#outgoing-number-grid').show();
		$('#_ctp_call_call').attr('disabled', 'disabled');
		$('#outgoing-call-stop').removeAttr('disabled');
		break;
	case 'offline': // Offline
		$('#_ctp_info').html('Try disabling the extension for a few minutes to clear out dangling connections');
		break;
	default:
		$('#configure').show();
		$('#incoming-form').hide();
		$('#outgoing-call-form').hide();
		$('#outgoing-text-form').hide();
		$('#outgoing-number-grid').hide();
		break;
	}
	// case 'busy':
	//	 $('#info').css('background','#ff8500');
	//	 $('#info').html('In a Call');
	//	 break;
	// case 'offline':
	//	 $('#info').css('background','#f00');
	//	 $('#info').html('Twilio Client is Offline');
	//	 break;
});
