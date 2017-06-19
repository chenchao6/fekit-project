require("plugins/validator/jquery.jvalidator.js");
$.jvalidator.addPattern({
	name: "notEmpty",
	message: "请填写内容",
	validate: function(value, callback) {
		var str = "请填写内容";
		var message = this.getAttribute('data-input-key');
		if(message){
			str = "请填写" + message ;
		}
		callback($.trim(value) !="", str);
	}
});