

var DEFAULT_TEMPLATE = "<li code='{{code}}'>{{name}}</li>" //默认填充数据的模板;

var Cfg = {
	DEFAULT_LIST_SELECTOR: ".swap-page-wrapper"
}

var miniView = require("plugins/miniView/miniView.js");

var doc = document;
var noop = function() {}

var ListNimiView = function(el, opts) {
	this.opts = $.extend(true, {
		title : null,
		url: null, //获取数据的url
		dataType:"json",
		tmpl: null, //填充数据列表的模板
		listSelector: null, //列表元素的选择器
		current : null,
		name: "", //是省份还是市还是区还是县
		on: {
			selected: noop,
			render : noop,
			hided : noop,
			showed : noop,
			beforeHide : noop
		}
	}, opts);
	if(!el){
		this.autoBuildEl = true;
		el = $(doc.createElement("div")).appendTo(doc.body);
	}
	this.$el = el;
	if(!el){
		this.innerBuildDom = true;
	}
	this.listSelector = this.opts.listSelector || Cfg.DEFAULT_LIST_SELECTOR;
	this.init();
}

ListNimiView.prototype = {
	init: function() {
		this.preBuild();
		this.getListData();
	},
	preBuild: function() {
		this.___setMiniView();
		this.$listEl = this.$el.find(this.listSelector);
		this.$loading = this.$el.find(".loading");
		this.bindEvents();
	},
	___setMiniView: function() {
		var me = this;
		this.miniView = new miniView({
			el : this.$el,
			current : this.opts.current,
			title : this.opts.title,
			hidedAndRemove : true,
			needLoading : true,
			setHeight : true,
			on: {
				hided: function(isGoBack) {
					me.opts.on.hided && me.opts.on.hided.call(me,isGoBack);
				},
				beforeShow: function() {
					me.opts.on.beforeShow && me.opts.on.beforeShow.call(me);
				},
				showed : function(){
					me.opts.on.showed && me.opts.on.showed.call(me);
				},
				beforeHide : function(){
					me.opts.on.beforeHide && me.opts.on.beforeHide.call(me);
				}
			}
		});
	},
	bindEvents: function() {
		var me = this,
			name = this.opts.name;
		//绑定选中按钮事件 
		this.$listEl.on("click", ".js-item", function(evt) {
			me.data = $(this).data();
			me.data.key = name;
			me.opts.on.selected.call(me, me.data); //选中后通知外部对象已经选择

		});
		this.$listEl.bind("swipe",function(evt,data){
			console.log(data);
		})
	},
	/**
	 * 获取选中的数据
	 * @return {Object} 数据对象
	 */
	getData: function(){
		return this.data;
	},
	clear : function(){
		this.data = null;
	},
	/**
	 * 渲染列表
	 * @param  {Array} dataArr 请求后返回的数据数组
	 */
	render: function(dataArr) {
		var html = "";
		if(this.opts.on.render){
			html = this.opts.on.render.call(this, dataArr);
		}else{
			html += this.opts.tmpl.render({data : dataArr});
		}
		this.$listEl.html(html);
	},
	/**
	 * 获取数据的接口
	 * @param  {Function} callback 获取数据的回调函数,可选
	 */
	getListData: function(callback) {
		var me = this;
		this.loading();
		if(!this.opts.url && this.opts.on.getData){
			var data = this.opts.on.getData();
			data = data instanceof Array? data : [data];
			me.render(data);
			callback && callback(data);
		}
		$.ajax({
			url: this.opts.url,
			dataType: this.opts.dataType,
			success : function(data) {
				me.hideLoading();
				if (data.content) {
					me.render(data.content);
					me.miniView.show();
				}else{
					me.miniView.hide();
					me.opts.on.error && me.opts.on.error(e);
				}
				callback && callback(data);
			},
			error : function(xhr,e){
				me.miniView.hide();
				me.opts.on.error && me.opts.on.error(e);
			}
		});
	},
	show : function(callback){
		this.miniView.show(callback);
	},
	hide : function(callback){
		this.miniView.hide(callback);
	},
	/**
	 * 展示加载中...
	 */
	loading: function() {
		this.$loading.show();
	},
	/**
	 * 隐藏加载中图标
	 */
	hideLoading: function() {
		this.$loading.hide();
	},
	distory : function(){
		this.miniView.distory();
	}
}

module.exports = ListNimiView;