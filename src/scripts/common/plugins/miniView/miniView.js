var noop = function() {}

var isUc = navigator.userAgent.indexOf('UCBrowser') > -1;
var isQQBrowser = navigator.userAgent.indexOf('MQQBrowser') > -1;
var DEFAULT_CLASS = 'miniview'
require("plugins/hogan/hogan.js");
require("./mustache/wrapper.mustache");
var DEFAULT_WRAPPER = QTMPL.wrapper;


var guid = (function() {
	var id = 1001;
	return function() {
		return id++;
	}
})()

var docElement = document.documentElement;

var miniView = function(opts) {
	this.opts = $.extend(true, {
		el: null,
		distance: 0,
		current: null,
		title: null,
		content: "",
		needLoading: false,
		setHeight: false,
		hidedAndRemove: false,
		defaultShow: false,
		direction: 'left',
		on: {
			hided: noop,
			showed: noop
		}
	}, opts || {});

	if (!this.opts.el) {
		throw new Error("必须要有滚动的元素");
	}
	var el = this.opts.el;
	if (this.opts.el.length) {
		el = el.get(0);
	}
	this.el = el;
	this.status = "hide";
	this.uniqueId = this.zIndex = guid();
	this.width = docElement.clientWidth;
	this.animateMethod = "translate3d";
	this.distance = this.opts.distance || docElement.clientWidth;
	this.init();
}



miniView.prototype = {
	init: function() {
		$(this.el).addClass(DEFAULT_CLASS);
		this.el.innerHTML = (this.opts.tpl && this.opts.tpl.render(this.opts)) || DEFAULT_WRAPPER.render(this.opts);
		this.setContent();
		this.setFooter();
		this.el.style.cssText = 'overflow-x: hidden;width:' + this.width + ';z-index:' + (this.zIndex) + ';left:' + this.width + 'px;top:0px;';
		this.bindEvents();
		if (this.opts.setHeight) {
			this.setHeight();
		}
	},
	setContent: function() {
		if (this.opts.content) {
			$(this.el).find('[attr-tag="content"]').html(this.opts.content);
		}
	},
	setFooter: function() {
		if (this.opts.footer) {
			$(this.el).find('[attr-tag="footer"]').html(this.opts.footer);
		}
	},
	bindEvents: function() {
		var me = this;
		$(this.el).on("click", ".goback", function(evt) {
			//alert("asdasdasD");
			evt.stopPropagation();
			evt.preventDefault();
			me.hide(true);
		});

		var fn = function() {
			document.body.scrollTop = 0;
			if (me.status === "show") {
				
				me.prevCssText = me.el.style.cssText;
				me.el.style.cssText = "";
				return;
			}
			else{
               me.distory();
			}
			
		

		}

		$(this.el).unbind("webkitTransitionEnd").bind("webkitTransitionEnd", fn);
        
		
	},
	show: function() {
		document.body.scrollTop = 0;
		var width = docElement.clientWidth;
		var tansX = document.documentElement.clientWidth;
		this.status = 'show';
		this.el.style['display'] ='inline-block';
		this.el.style['-webkit-transition'] = 'all ' + (isUc || isQQBrowser ? 0.5 : 0.4) + 's';
		this.el.style['-webkit-transform'] = this.animateMethod + '(-' + tansX + 'px, 0 , 0)';
		this.opts.on.showed.call(this);
		return this;
	},
	hide: function(isGoBack) {
		var me = this;
		me.opts.on.beforeHide && me.opts.on.beforeHide.call(me);
		var tansX = document.documentElement.clientWidth;;
		this.status = 'hide';
		this.el.style.cssText = 'overflow-x: hidden;width:' + this.width + ';z-index:' + (this.zIndex) + ';left:' + this.width + 'px;top:0px;-webkit-transform:translateX(-' + tansX + 'px)';;
		setTimeout(function() {
			me.el.style['-webkit-transition'] = 'all '+(isUc || isQQBrowser ? 0.4 : 0.3)+'s';
			me.el.style.webkitTransform = me.animateMethod + '(0px, 0 , 0)';
			document.body.scrollTop = 0;
			me.opts.on.hided.call(me, isGoBack);
		}, 50);
	},
	setHeight: function() {
		var docHeight = document.documentElement.offsetHeight;
		this.el.style.height = docHeight + "px";
	},
	distory: function() {
		this.el.innerHTML = "";
		this.el.style.cssText = "";
		$(this.el).removeClass("miniview");
	
		this.opts.hidedAndRemove && $(this.el).empty()
		
		
	}
}

module.exports = miniView;