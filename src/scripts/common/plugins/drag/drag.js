(function() {
	var hasProp = {}.hasOwnProperty;
	var __DEFAULT_CLASS__ = "server",
		__ANIMATE_CLASS__ = "animation";
	// 工具
	var extend = function(child, parent) {
		for (var key in parent) {
			if (hasProp.call(parent, key)) child[key] = parent[key];
		}
		return child;
	};
	//类
	function Dragable(opts) {
		this.opts = extend({
			container: document.body,
			tag: null
		}, opts || {});

		this.range = {
			height: document.documentElement.clientHeight - this.opts.tag.offsetHeight,
			width: this.opts.container.offsetWidth - this.opts.tag.offsetWidth
		}
		this.centerWidth = this.range.width / 2;

		this.init();
	}
	Dragable.prototype = {
		init: function() {
			var tag = this.opts.tag,
				container = this.opts.container,
				me = this;
			tag.addEventListener("touchstart", function(event) {
				tag.setAttribute("touchmove",false);
				var getXY = event.touches[0];
				me.originalXY = { //先得到鼠标点击的地方在tag中的坐标,原点在tag的左上顶部
					x: getXY.clientX - tag.offsetLeft,
					y: getXY.clientY - tag.offsetTop
				};
				me.touchmove();
			});
		},
		touchmove: function() {
			var range = this.range;
			var	me = this;
			var tag = this.opts.tag;
			tag.addEventListener("touchmove",function(event){
				tag.setAttribute("touchmove",true);
				event.preventDefault();
				originalXY = me.originalXY || {};
				var getXY = event.touches[0];
				me.opts.tag.className = __DEFAULT_CLASS__;
				var slide = { //得到鼠标相对document移动的矢量
					x: getXY.clientX - originalXY.x,
					y: getXY.clientY - originalXY.y
				};

				if (slide.x > range.width) {
					slide.x = range.width;
				};
				if (slide.x < 0) {
					slide.x = 0;
				}
				if (slide.y > range.height) {
					slide.y = range.height;
				};
				if (slide.y < 0) {
					slide.y = 0;
				};
				me.moveXY(slide.x, slide.y);
				me.__mouseUp(slide);
			})
		},
		__mouseUp: function(slide) {
			var tag = this.opts.tag,
				me = this;
				range = this.range;
			tag.addEventListener("touchend",function(){
				if (slide.x < me.centerWidth) {
					me.addClass(tag, __ANIMATE_CLASS__);
					tag.style.left = 0 + 'px';
				} else {
					me.addClass(tag, __ANIMATE_CLASS__);
					tag.style.left = range.width + 'px';
				}
				me.stop();
			});
		},
		stop: function() {
			document.touchmove = null;
			document.touchend = null;
		},
		addClass: function(ele, className) {
			var oldClassName = ele.className;
			var newClassName = oldClassName.indexOf(className) === -1 ? oldClassName + ' ' + className : oldClassName;
			return ele.className = newClassName;
		},
		moveXY: function(x, y) {
			var tag = this.opts.tag;
			var me = this;
			tag.style.left = (x) + 'px';
			tag.style.top = y + 'px';
		}
	}
	module.exports = Dragable;
})()
