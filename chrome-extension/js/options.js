/**
	Options Page
*/

var bgp = chrome.extension.getBackgroundPage();

var VBX_Options = {

	t: null,

	init: function()
	{
		$('#_ctp_user_sid').val(bgp.getData('_user_sid'));
		$('#_ctp_auth_tid').val(bgp.getData('_auth_tid'));
		$('#_ctp_plug_did').val(bgp.getData('_plug_did'));
		$('#_ctp_open_url').val(bgp.getData('_open_url'));

		$('#_ctp_bell_i').attr('checked',bgp.getData('bell_i'));
		$('#_ctp_bell_t').attr('checked',bgp.getData('bell_o'));
		$('#_ctp_bell_o').attr('checked',bgp.getData('bell_t'));

		$('#_ctp_sess_uid').val(bgp.twilioSession.token);

		// Plivo Options
		$('#plivo-aid').val(bgp.getData('plivo-aid'));
		$('#plivo-key').val(bgp.getData('plivo-key'));
		$('#plivo-username').val(bgp.getData('plivo-username'));
		$('#plivo-password').val(bgp.getData('plivo-password'));

		if (bgp.ApplicationList.length) {
			$('#_ctp_prog_sid').append('<option>- Choose One -</option>');
			bgp.ApplicationList.forEach(function(n, i) {
				$('#_ctp_prog_sid').append('<option value="' + n.sid + '">' + n.friendly_name + '</option>');
			});
		}
		$('#_ctp_prog_sid').val(bgp.getData('_prog_sid'));

		var warn = bgp.getData('_option_warn');
		if (warn) {
			$('#alert-wrap').append('<div class="alert alert-warning">' + warn + '</div>');
			bgp.setData('_option_warn', '');
		}

	},

	// Save Function
	save: function()
	{

		bgp.setData('_user_sid', $('#_ctp_user_sid').val());
		bgp.setData('_auth_tid', $('#_ctp_auth_tid').val());
		bgp.setData('_prog_sid', $('#_ctp_prog_sid').val());
		bgp.setData('_plug_did', $('#_ctp_plug_did').val());
		bgp.setData('_open_url', $('#_ctp_open_url').val());

		bgp.setData('bell_i', $('#_ctp_bell_i').attr('checked'));
		bgp.setData('bell_o', $('#_ctp_bell_o').attr('checked'));
		bgp.setData('bell_t', $('#_ctp_bell_t').attr('checked'));

		bgp.setData('plivo-aid', $('#plivo-aid').val());
		bgp.setData('plivo-key', $('#plivo-key').val());
		bgp.setData('plivo-username', $('#plivo-username').val());
		bgp.setData('plivo-password', $('#plivo-password').val());

		$('input[type=text]').removeClass('diff');

		bgp.ctp.init();

	}
};

// Init my Thing
document.addEventListener("DOMContentLoaded", function () {

	$('#btn-media-access').on('click', function() {
		navigator.webkitGetUserMedia({audio: true, video: false},
			function(e) {
				// Pass Routine
				bgp.setData('mic-access', 'good');
				bgp.setData('mic-access-note', 'Access Granted!');
				$('#account-twilio').show();
				$('#account-plivo').show();
			},
			function(e) {
				// Fail Routine
				//switch (e.code) {
				//case 0: // Permission
				bgp.setData('mic-access-note', e.message);
				$('#media-access-info').html(e.message);
				$('#account-twilio').hide();
				$('#account-plivo').hide();
				break;
				//}
			}
		);
	});

	var x = bgp.getData('mic-access-note');
	if (x) {
		$('#media-access-info').html(x);
	}

	x = bgp.getData('mic-access');
	if ('good' === x) {
		$('#media-access-info').removeClass('btn-outline-secondary');
		$('#media-access-info').addClass('btn-success');
		$('#account-twilio').show();
		$('#account-plivo').show();
	}

	VBX_Options.init();

	$('input[type=text], input[type=checkbox]').on('keyup',function(e) {

		$(this).addClass('diff');
		if (VBX_Options.t) window.clearTimeout(VBX_Options.t);
		VBX_Options.t = window.setTimeout(VBX_Options.save, 250);

	});

	$('#_ctp_cmd_init').on('click', function() {
		bgp.ctp.init();
	});

});
