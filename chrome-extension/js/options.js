/**
	Options Page
*/

var bgp = chrome.extension.getBackgroundPage();

navigator.webkitGetUserMedia({audio: true, video: false}, function() {
	bgp.setData('mic-access', 'good');
}, function(e) {
	bgp.setData('mic-access', 'fail');
});

var cto = {

	t: null,

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

		$('input[type=text]').removeClass('diff');

	}
};

// Init my Thing
document.addEventListener("DOMContentLoaded", function () {

	$('#_ctp_user_sid').val(bgp.getData('_user_sid'));
	$('#_ctp_auth_tid').val(bgp.getData('_auth_tid'));
	$('#_ctp_prog_sid').val(bgp.getData('_prog_sid'));
	$('#_ctp_plug_did').val(bgp.getData('_plug_did'));
	$('#_ctp_open_url').val(bgp.getData('_open_url'));

	$('#_ctp_bell_i').attr('checked',bgp.getData('bell_i'));
	$('#_ctp_bell_t').attr('checked',bgp.getData('bell_o'));
	$('#_ctp_bell_o').attr('checked',bgp.getData('bell_t'));

	$('#_ctp_sess_uid').val(bgp.Session.token);
	$('#_ctp_cmd_init').on('click', function() {
		bgp.ctp.init();
	});

	$('input[type=text], input[type=checkbox]').on('keyup',function(e) {

		$(this).addClass('diff');
		if (cto.t) window.clearTimeout(cto.t);
		cto.t = window.setTimeout(cto.save, 250);

	});

	var warn = bgp.getData('_option_warn');
	if (warn) {
		$('#warn').html(warn);
		bgp.setData('_option_warn', false);
	}

	$('#cmd-done').on('click',function() {
		window.close();
	});

});
