require("plugins/validator/jquery.jvalidator.js");
$.jvalidator.addPattern({
	name: "code",
	message: "请填写验证码",
	validate: function(value, callback) {
		var isCode = /^\w{4,6}$/g.test(value);
		var isEmpty = $.trim(value) == ""
		callback(isCode, isEmpty?"请填写验证码":"验证码不正确");
	}
});