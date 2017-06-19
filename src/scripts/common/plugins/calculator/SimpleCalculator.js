/**
 * @constructor
 * @param {HTMLElement|jQuery实例化对象} placeholderElement 占位元素也就是计算器组件要添加到的位置
 * @param {Object} options 配置参数
 * @param {int} options.defaultValue 初始化input value
 * @param {int} options.minValue input中可显示的最小值
 * @param {int} options.maxValue input中可显示的最大值
 * @param {int} options.zIndex 组件的zIndex值 主要用于解决ie6下超出提示浮层被其他元素覆盖问题
 * @param {Function} options.onChange(e, val) 当input中值变化时触发的事件
 * @param {Object} e 事件对象
 * @param {int} val 当前input数值
 *
 * @example
 * new SimpleCalculator($(".simpleCalculator"), {
 *     defaultValue: 10,
 *     minValue: 0,
 *     maxValue: 100,
 *     onChange: function(e, val){
 *         //todo
 *     }
 * });
 */
//按钮禁用class
var SIMPLECALCULATOR_BTN_DISABLED = "valuecomb_disable",
	//+hover class
	SIMPLECALCULATOR_BTN_ADD_HOVER = "increase_hover",
	//-hover class
	SIMPLECALCULATOR_BTN_SUB_HOVER = "decrease_hover",
	//+selector
	SIMPLECALCULATOR_BTN_ADD_SELECTOR = ".increase",
	//-selector
	SIMPLECALCULATOR_BTN_SUB_SELECTOR = ".decrease",
	//超出最小提示样式
	LESS_THAN_MIN = "sub",
	//超出最大提示样式
	GREATER_THAN_MAX = "add";

//默认配置
var defaultOptions = {
	defaultValue: 0,
	minValue: 0,
	maxValue: Number.MAX_VALUE,
	rule: 1
};

var template = ['<div class="valuecomb" >', '<span onselectstart="return false;" style="-moz-user-select:none;" class="decrease decrease fl btn-select">-</span>', '<span class="ct fl">', '<input type="text" class="input-number fl" >', '</span>', '<span onselectstart="return false;" style="-moz-user-select:none;"  class="increase fl btn-select">+</span>', '<label class="f14 txt-warning warning hint hide"><i class="icon-warning"></i><span class="hintContent"></span></label>','</div>'].join("");

function SimpleCalculator(placeholderElement, options) {

	if (!placeholderElement && !placeholderElement.jquery || placeholderElement.length < 1 || placeholderElement[0].nodeType !== 1 && placeholderElement.nodeType !== 1) {
		var selector = placeholderElement ? placeholderElement.selector : "";
		//console && console.log && console.log("placeholderElement"+selector+"必须是html元素或者jQuery对其的封装对象");
		//throw new Error("placeholderElement必须存在且为jquery封装的对象!");
		return false;
	}

	this.options = $.extend({}, defaultOptions, options);
	//jq根元素
	this._jqRootElement = $(template).insertBefore($(placeholderElement));
	//jq+按钮
	this._jqAddBtn = null;
	//jq-按钮
	this._jqSubBtn = null;
	//jq input
	this._jqInput = null;
	//超出最大或最小提示
	this._jqHint = null;
	//关闭提示setTimeout对象
	this._hintTimeout = null;

	this._init();
}


$.extend(SimpleCalculator.prototype, {
	/**
	 * 获取当前input上的值
	 * @param {String} returnType 如果值为string 直接返回input上的值
	 * 如果不是string 则将input上的值转换成number
	 */
	getValue: function(returnType) {
		//如果this._jqInput渲染失败,则返回0
		if (!this._jqInput) {
			return 0;
		}
		var val = this._jqInput.val();
		if (this.options.rule == 1) {
			return returnType === "string" ? val : parseInt(val, 10);
		} else if (this.options.rule) {
			return parseFloat(val);
		}
	},
	/**
	 * 设置input的value
	 * @param {int} val 将val赋给input
	 * @param {Boolean} true 不触发_inputChangeHandler
	 */
	setValue: function(val, notTrigger, evt) {
		if (this._jqInput && this._jqInput.length) {
			this._jqInput.val(val);
		}
		//代表主件自己触发加减
		if (notTrigger == true) {
			this._checkBtnStatus(val);
		} else {
			this._inputChangeHandler(evt);
		}
		return this;
	},
	/**
	 * 设置组件可显示的最小值
	 * @param {Number} value
	 */
	setMinValueOfOptions: function(value) {
		if ($.type(value) !== "number" || !this.options) {
			return;
		}
		this.options.minValue = value;
		this._checkBtnStatus(this.getValue());
		return this;
	},
	/**
	 * 设置组件可显示的最大值
	 * @param {Number} value
	 */
	setMaxValueOfOptions: function(value) {
		if ($.type(value) !== "number" || !this.options) {
			return;
		}
		this.options.maxValue = value;
		this._checkBtnStatus(this.getValue());
		return this;
	},

	show: function() {
		this._jqRootElement.show();
	},

	hide: function() {
		this._jqRootElement.hide();
	},

	_init: function() {
		this._getNeededNodes();
		this._initEvents();
		this.setValue(this.options.defaultValue, true);
		this._checkBtnStatus(this.options.defaultValue);
		if (!isNaN(this.options.zIndex)) {
			this._jqRootElement.css("zIndex", this.options.zIndex);
		}
	},

	_getNeededNodes: function() {
		this._jqSubBtn = this._jqRootElement.find(SIMPLECALCULATOR_BTN_SUB_SELECTOR);
		this._jqAddBtn = this._jqRootElement.find(SIMPLECALCULATOR_BTN_ADD_SELECTOR);
		this._jqInput = this._jqRootElement.find("input");
		this._jqInput.attr("autoComplete", false);
		this._jqHint = this._jqRootElement.find(".hint");
	},

	_initEvents: function() {
		var self = this;

		this._jqSubBtn.click(function(e) {
			self._subBtnClickHandler(e, '__sub__');
		});

		this._jqAddBtn.click(function(e) {
			self._addBtnClickHandler(e, '__add__');
		})
		//keydown时对输入字符进行校验
		//ie8- 采用keydown + paste
		this._jqInput.bind("input", function(e) {
			setTimeout(function() {
				self._inputChangeHandler(e);
			});
		}).blur(function() {
			self._inputBlurHandler();
		});

		//onchange事件
		var changeFun = this.options.onChange;
		if (typeof changeFun === "function") {
			$(this).bind("change", function(e, val) {
				changeFun(e, val);
			});
		}
	},

	_inputChangeHandler: function(evt) {
		var currentVal = this.getValue("string");
		if (currentVal === "") {
			return;
		}
		var currentValidVal = $(this).data("inputValidVal");
		var isInvalidVal = isNaN(currentVal);
		var currentIntVal = parseInt(this.options.rule) == 0 ? parseFloat(currentVal) : parseInt(currentVal, 10);

		if (isInvalidVal) {
			newCurrentIntVal = currentValidVal ? this.options.minValue : this.options.defaultValue;
		} else if (currentIntVal <= this.options.minValue) {
			newCurrentIntVal = this.options.minValue;
		} else if (currentIntVal > this.options.maxValue) {
			newCurrentIntVal = this.options.maxValue;
		} else {
			newCurrentIntVal = currentIntVal;
		}
		/**
		 * @description reset this SimpleCalculator when  it's changed by other SimpleCalculator
		 * the evt is an object of Event , if evt is not defined , It means that this SimpleCalculator is being action by other
		 * SimpleCalculator.
		 * so , in this time , we set the minValue for this SimpleCalculator;
		 */
		if (!evt) {
			newCurrentIntVal = this.options.minValue;
		}

		$(this).data("inputValidVal", newCurrentIntVal);

		this._checkBtnStatus(newCurrentIntVal);
		this._jqInput.val(newCurrentIntVal);

		if (newCurrentIntVal !== currentValidVal) {
			$(this).trigger("change", [newCurrentIntVal]);
		}
	},

	_inputBlurHandler: function() {
		if ($.trim(this.getValue("string")) === "") {
			this.setValue(this.options.minValue);
		}
	},

	_btnMouseoverHandler: function(element) {
		var jqElement = $(element);
		if (jqElement.hasClass(SIMPLECALCULATOR_BTN_DISABLED)) {
			return;
		}
		jqElement.addClass("." + jqElement.attr("class") === SIMPLECALCULATOR_BTN_ADD_SELECTOR ? SIMPLECALCULATOR_BTN_ADD_HOVER : SIMPLECALCULATOR_BTN_SUB_HOVER);
	},

	_btnMouseoutHandler: function(element) {
		$(element).removeClass(SIMPLECALCULATOR_BTN_ADD_HOVER).removeClass(SIMPLECALCULATOR_BTN_SUB_HOVER);
	},

	_addBtnClickHandler: function(e) {
		if (this._jqAddBtn.hasClass(SIMPLECALCULATOR_BTN_DISABLED)) {
			this._showHint("add");
			return;
		}
		var currentValue = this.getValue();
		this.setValue(currentValue + this.options.rule, '__add__', e);
		if (currentValue + this.options.rule >= this.options.maxValue) {
			this._jqAddBtn.removeClass(SIMPLECALCULATOR_BTN_ADD_HOVER);
		}
	},

	_subBtnClickHandler: function(e) {
		if (this._jqSubBtn.hasClass(SIMPLECALCULATOR_BTN_DISABLED)) {
			this._showHint("sub");
			return;
		}
		var currentValue = this.getValue();
		this.setValue(currentValue - this.options.rule, '__sub__', e);
		if (currentValue - this.options.rule <= this.options.minValue) {
			this._jqSubBtn.removeClass(SIMPLECALCULATOR_BTN_SUB_HOVER);
		}
	},
	/**
	 * +-按钮状态为禁用时 点击给予提示
	 * @param {String} type add 点击禁用+ sub 点击禁用-
	 */
	_showHint: function(type) {

		clearTimeout(this._hintTimeout);

		this._jqHint.removeClass(LESS_THAN_MIN + " " + GREATER_THAN_MAX);
		this._jqHint.addClass(type === "add" ? GREATER_THAN_MAX : LESS_THAN_MIN);
		var text = "最" + (type === "add" ? "大" : "小") + "值不能" + (type === "add" ? "大于" : "小于") + (type === "add" ? this.options.maxValue : this.options.minValue);

		if (this.options.descSchemes == 'two') {
			var unitStr = this.options.unitStr || '';
			text = type == "add" ? '亲，该产品最多只能预订' + this.options.maxValue + unitStr + '哦！' : '亲，该产品最少' + this.options.minValue + unitStr + '起订哦！';
		}

		this._jqHint.find(".hintContent").text(text);
		this._jqHint.show();

		var self = this;
		if(this.options.autoHide){
			this._hintTimeout = setTimeout(function() {
				self._jqHint.hide();
			}, 1500);
		}
	},

	_checkBtnStatus: function(currentValue) {
		currentValue <= this.options.minValue ? this._jqSubBtn.addClass(SIMPLECALCULATOR_BTN_DISABLED) : this._jqSubBtn.removeClass(SIMPLECALCULATOR_BTN_DISABLED);
		currentValue >= this.options.maxValue ? this._jqAddBtn.addClass(SIMPLECALCULATOR_BTN_DISABLED) : this._jqAddBtn.removeClass(SIMPLECALCULATOR_BTN_DISABLED);
	}
});

module.exports = SimpleCalculator;