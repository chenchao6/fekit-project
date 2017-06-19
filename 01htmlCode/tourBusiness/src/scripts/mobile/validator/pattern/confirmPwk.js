$.jvalidator.addPattern({
	name: "re-pwd",
	message: "两次输入的密码必须一致",
	validate: function(value, callback) {
		var f_pwd = $("#f-pwd").val();
		callback(f_pwd === value);
	}
});
