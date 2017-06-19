require("plugins/hogan/hogan.js");
require("./src/mustache/confirmDialog.mustache");
var dialog = require("./src/dialog.js");
var noop = function() {};
var confirmDialog = function(opts) {
	this.opts = $.extend(true, {
		container: $(document.body),
		defaultShow: false,
		autoCenter: false,
		btns: [{
			type: "cancel",
			"name": "取消"
		}, {
			type: "ok",
			"name": "确定"
		}],
		on: {
			beforeShow: noop,
			afterShow: noop,
			beforeHide: noop,
			afterHide: noop,
			confirm: noop
		}
	}, opts || {});
	this.opts.tmpl = QTMPL.confirmDialog;
	this.timer = null;
	this.init();
	return this;
}

confirmDialog.prototype = {
	init: function() {
		var me = this;
		this.dialogInstance = new dialog($.extend({}, this.opts, {
			autoCenter: true,
			on: {
				afterShow: function() {
					me.afterShow();
				},
				afterHide: function() {
					me.opts.on.afterHide();
				}
			}
		}));
		this.dialogInstance.show();
	},
	afterShow: function() {
		var me = this;
		var dialogInstance = this.dialogInstance;
		dialogInstance.$el.find('[attr-tag="ok"]').click(function() {
			me.opts.on.confirm && me.opts.on.confirm(function() {
				dialogInstance.hide();
			});
		});
		dialogInstance.$el.find('[attr-tag="cancel"]').click(function() {
			if (me.opts.on.cancel) {
				me.opts.on.cancel(function() {
					dialogInstance.hide();
				});
			} else {
				dialogInstance.hide();
			}
		});
		this.opts.on.afterShow && this.opts.on.afterShow(this.dialogInstance);
	}
}

module.exports = confirmDialog;