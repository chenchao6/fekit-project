
var noop = function() {};
var dialog = function(opts) {
	this.opts = $.extend(true, {
		container: $(document.body),
		autoHide: false,
		content: "",
		timeOut: 2000,
		tmpl : QTMPL.dialog,
		defaultShow: false,
		autoCenter : true,
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

dialog.prototype = {
	init: function() {
		var el = this.$el = $(this.opts.tmpl.render(this.opts));
		this.opts.container.append(el);
		this.opts.autoCenter && (this.center());
		this.bindEvents();
		this.opts.defaultShow && this.show();
	},
	bindEvents: function() {
		var me = this;
		//点击浮层关闭
		this.$el.find("[attr-tag='cover']").click(function() {
			me.hide();
		});
	},
	show: function() {
		var me = this;
		this.$el.removeClass("hide");
		this.$el.addClass("in");
		if (this.opts.autoHide) {
			this.timer = setTimeout(function() {
				me.hide();
			}, this.opts.timeOut);
		}
		this.opts.on.afterShow();
	},
	center: function(){
		var winHeight = $(window).height(),
			winWidth = $(window).width();
		var domHeight = this.$el.height(),
			domWidth = this.$el.width();

		this.$el.css({
			top : (winHeight- domHeight + $(window).scrollTop())/2 + "px",
			left : (winWidth- domWidth)/2 + "px"
		});
	},
	hide: function() {
		clearTimeout(this.timer);
		this.$el.remove();
		this.opts.on.afterHide();
	}
}

module.exports = dialog;