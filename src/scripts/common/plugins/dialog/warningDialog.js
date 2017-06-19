require("plugins/hogan/hogan.js");
require("./src/mustache/dialog.mustache");
var dialog = require("./src/dialog.js");
var noop = function() {};
var warningDialog = function(opts) {
	this.opts = $.extend(true, {
		container: $(document.body),
		autoHide: false,
		content: "",
		timeOut: 2000,
		defaultShow: true,
		autoCenter : false,
		overmask: false,
		on: {
			beforeShow: noop,
			afterShow: noop,
			beforeHide: noop,
			afterHide: noop
		}
	}, opts || {});
	this.timer = null;
	this.init();
	return this;
}

warningDialog.prototype = {
	init: function() {
		var me = this;
		this.dialogInstance = new dialog(this.opts);
		this.dialogInstance.$el.bind("click", function(evt){
			me.dialogInstance.hide();
		})
		this.dialogInstance.show();
	}
}

module.exports = warningDialog;