/**
	This is run every time the popup becomes visible
*/

var bgp = chrome.extension.getBackgroundPage();

// Init my Thing
document.addEventListener("DOMContentLoaded", function () {

	// $('#_ctp_take_form').hide();
	// $('#_ctp_call_form').hide();
	// $('#_ctp_text_form').hide();
	// $('#_ctp_talk').hide();

	$('#_ctp_call_dial').val( bgp.getData('call_dial_last') );
	$('#_ctp_text_dial').val( bgp.getData('text_dial_last') );

	$('#_ctp_call_call').on('click',function() {
		bgp.setData('call_dial_last', $('#_ctp_call_dial').val());
		bgp.ctp.call( $('#_ctp_call_dial').val() );
		//window.close();
	});
	$('#_ctp_call_kill').on('click',function() {
		bgp.ctp.kill();
		window.close();
	});

	$('#_ctp_text_send').on('click',function() {
		$('#_ctp_text_send').attr('disabled',true);
		$('#_ctp_info').html('Sending...');
		bgp.ctp.text( $('#_ctp_text_dial').val(), $('#_ctp_text_body').val(), function() {
			$('#_ctp_info').html('Text Sent');
			$('#_ctp_text_text').val('');
			$('#_ctp_text_send').attr('disabled',false);
			window.close();
		});
	});

	$('#_ctp_text_list').on('click',function() {
		$('#_ctp_info').html('Loading...');
		$('#_ctp_call_form').hide();
		$('#_ctp_talk_form').hide();
		$('#_ctp_text_form').hide();
		$('#_ctp_text_send').attr('disabled',true);
		bgp.ctp.text_list(function(res,ret,jhr) {
			if (res.sms_messages) {
				var h = '<table>';
				for (var i in res.sms_messages) {
					var m = res.sms_messages[i];
					h += '<tr><td>' + m.from + '</td><td>' + m.to + '</td></tr>';
					h += '<tr><td colspan="3">' + m.body + '</td></tr>';
				}
				h += '</table>';
			}
			$('#_ctp_info').hide();
			$('#_ctp_text_form').html(h);
			$('#_ctp_text_form').show();
		});
	});

	$('#logs-list').on('click',function() {
		$('#_ctp_info').html('Loading...');
		$('#_ctp_call_form').hide();
		$('#_ctp_talk_form').hide();
		$('#_ctp_text_form').hide();
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
			$('#_ctp_text_form').html(h);
			$('#_ctp_text_form').show();
		});

	});

	// @todo should be Phone.status();
	var s = 'perm';
	try {
		s = bgp.Twilio.Device.status();
		if (bgp.Connection) {
			s += '/' + bgp.Connection.status();
		}
	} catch (e) {
		// Ignore
	}
	console.log('PopuP Status: ' + s);

	switch (s) {
	case 'ready':
		$('#status').html('Ready');
		$('#_ctp_call_form').show();
		$('#_ctp_text_form').show();
		$('#_ctp_talk_form').hide();
		break;
	case 'ready/pending':

		$('#status').html('Ring! Ring!');
		$('#_ctp_take_form').show();
		$('#_ctp_talk_form').show();

		var url = bgp.getData('_open_url');
		if ((undefined !== url) && (url.length > 5)) {
			url = url.replace('{PHONE}', bgp.Connection.parameters.From);
			$('#_take_link').attr('href', url);
			$('#_take_link').text(bgp.Connection.parameters.From);
		}

		$('#call-answer').on('click',function() {
			console.log('take-call-click');
			bgp.ctp.take();
			window.close();
		});

		$('#call-ignore').on('click',function() {
			bgp.ctp.callIgnore();
			// window.close();
		});

		break;
	case 'busy': // In Call
		$('#info').html('Talk: ' + bgp.ctp.Connection.parameters.To);
		// $('#_ctp_call_form').hide();
		$('#_ctp_talk_form').show();
		break;
	case 'busy/open': // In Call
		$('#_ctp_talk_form').show();
		break;
//	case 410: // Dropped
//		$('#_ctp_call').show();
//		break;
	case 'offline': // Offline
		$('#_ctp_info').html('Try disabling the extension for a few minutes to clear out Flash/Twilio dangling connections');
		break;
	default:
		$('#_ctp_info').html('Configure Options');
		// alert('What to do with: ' + s);
		// $('#_ctp_info').html('What! ' . bgp.Twilio.Device.status());
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
