require("plugins/validator/jquery.jvalidator.js");
$.jvalidator.addPattern({
	name: "pwd",
	message: "请输入6到18位的字符",
	validate: function(value, callback) {
		var stc = /^\w{6,18}$/g.test(value);
		callback(stc);
	}
});