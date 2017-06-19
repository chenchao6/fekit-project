require("plugins/validator/jquery.jvalidator.js");
$.jvalidator.addPattern({
	name: "email",
	message: "必须是电话号码",
	validate: function(value, callback) {
		var mailAdress = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/g.test(value);
		callback(mailAdress);
	}
});