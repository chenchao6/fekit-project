$.jvalidator.addPattern({
	name: "pwd",
	message: "密码是由6-18个字符，由字母或数字组成",
	validate: function(value, callback) {
		var password = /^[a-zA-Z0-9_\.\-@]{6,18}$/g.test(value);
		callback(password);
	}
});