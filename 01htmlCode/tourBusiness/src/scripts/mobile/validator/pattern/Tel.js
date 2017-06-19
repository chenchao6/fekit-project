require("plugins/validator/jquery.jvalidator.js");
$.jvalidator.addPattern({
	name: "Tel",
	message: "您填写的手机号码不正确",
	validate: function(value, callback) {
		this.value = value = $.trim(value);
		var phoneNum = /^1\d{10}$/g.test(value);
		var isEmpty = $.trim(value) == ""
		callback(phoneNum, isEmpty?'请输入手机号码' : '您填写的手机号码不正确');
	}
});