require("plugins/validator/jquery.jvalidator.js");
$.jvalidator.addPattern({
	name: "emailOrTel",
	message: "必须是电话号码或者是电子邮箱地址",
	validate: function(value, callback) {
		this.value = value = $.trim(value);
		var phoneNum = /^1\d{10}$/g.test(value);
		var mailAdress = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/g.test(value);
		callback(phoneNum || mailAdress);
	}
});