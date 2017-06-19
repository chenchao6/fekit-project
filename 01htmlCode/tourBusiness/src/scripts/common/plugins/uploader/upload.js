require("plugins/hogan/hogan.js");
require("./src/mustache/imageItem.mustache");
var uploader = require("./src/uploader.js");
var weChatUploader = require("./src/WeChatUpload.js");
var warnDialog = require("plugins/dialog/warningDialog.js");
var canvas = document.createElement("canvas");

var RegexMap = {
	image: {
		regex: /(jpg|png|gif)/ig,
		name: "图片"
	}
}

function getObjectURL(file) {
	var url = null;
	if (window.createObjectURL != undefined) { // basic
		url = window.createObjectURL(file);
	} else if (window.URL != undefined) { // mozilla(firefox)
		url = window.URL.createObjectURL(file);
	} else if (window.webkitURL != undefined) { // webkit or chrome
		url = window.webkitURL.createObjectURL(file);
	}
	return url;
}

var guid = (function() {
	var id = 1;
	return function() {
		return id++;
	}
})()

var isWeChat = /MicroMessenger/i.test(navigator.userAgent);

var fileMap = {}

var noop = function() {},
	ID_PREFIX = "#image_upload_";
var upload = function(opts) {
	this.opts = $.extend(true, {
		fileInput: null,
		listEl: null,
		uploadUrl: "",
		max: 3,
		type: "image",
		data: [],
		on: {
			"deleted": noop,
			previewImage: noop,
			before: noop
		}
	}, opts);
	this.filterRegex = RegexMap[this.opts.type] || false;
	if (this.opts.data) {
		this.data = $.isArray(this.opts.data) ? this.opts.data : [this.opts.data];
	}
	
	this.data = this.data || [];
	this.init();
}
upload.prototype = {
	init: function() {
		var opts = this.opts;
		var me = this;
		//如果是微信端的直接上传
		if (isWeChat) {
			this.setWeChatUpload();
		} else {
			this.setNormalUpload();
		}
		this.bindEvents();

		//如果有默认数据，则保存
		if (this.data.length) {
			this.preview(this.data, null, true);
		}
	},

	setWeChatUpload: function() {
		var opts = this.opts;
		var me = this;
		opts.fileInput.parentNode.removeChild(opts.fileInput);
		this.WeChatUploadModule = new weChatUploader(this.opts.uploadBtn, {
			count: this.opts.max,
			on: {
				preview: function(ids,selectIds) {
					me.preview(ids);
				},
				/**
				 * 上传成功之后的处理函数
				 * @param  {[type]} localIds 上传到微信服务器后返回的服务器ID
				 * @return {[type]}          [description]
				 */
				success: function(localIds,serviceIds) {
					try {
						$.each(localIds, function(index, item) {
							me.data.push(serviceIds[index]);
							me.progress(item, 1, 1); //上传成功
							me.setImageUrl(item, {url : serviceIds[index]});
						});
						me.WeChatUploadModule.changeCount(opts.max - me.data.length);
					} catch (e) {
						alert(e);
					}

				},
				//失败的时候
				failure: function(type){
					switch(type){
						case "MAX":
							var dialog = new warnDialog({
								autoHide: true,
								defaultShow: true,
								content: "最多只能上传"+me.opts.max+"张图片"
							});
							break;
						default : break;
					}
				}
			}
		});
	},

	setNormalUpload: function() {
		var opts = this.opts;
		var me = this;
		this.uploader = new uploader({
			fileInput: opts.fileInput,
			uploadUrl: this.opts.uploadUrl,
			type: this.opts.type,
			on: $.extend({}, opts.on, {
				change: function(files, cb) {
					var arr = [],
						data = me.data;
					for (var i = 0, len = files.length; i < len; i++) {
						if (me.filterRegex.regex) {
							if (me.filterRegex.regex.test(files[i].name)) {
								arr.push(files[i]);
							}
						} else {
							arr.push(files[i])
						}
					}
					if (data && data.length >= me.opts.max) {
						var dialog = new warnDialog({
							autoHide: true,
							defaultShow: true,
							content: "最多只能上传三张图片"
						});
						return;
					}
					if (arr.length != files.length) {
						var dialog = new warnDialog({
							autoHide: true,
							defaultShow: true,
							content: "上传的文件格式必须是：" + (me.filterRegex.name || "图片")
						});
						return;
					}
					me.preview(arr, function() {
						cb(arr);
					})
				},
				//先执行过滤方法
				filter: function(files) {
					var arr = [];
					for (var i = 0, len = files.length; i < len; i++) {
						if (me.filterRegex.regex) {
							if (files[i].name.match(me.filterRegex.regex)) {
								arr.push(files[i]);
							}
						} else {
							arr.push(files[i])
						}
					}
					return arr;
				},
				success: function(file, data) {
					if (data.status) {
						me.setData(data.content);
						me.setImageUrl(file, data.content[0]);
					}
					me.opts.on.success && me.opts.on.success.call(this, data);
				},
				progress: function(file, evt) {
					me.progress(file, evt.loaded, evt.total);
				}
			})
		});
	},
	progress: function(file, loaded, total) {
		var name = typeof file === "string" ? file : file.name;
		var mappingId = fileMap[name];
		if (mappingId) {
			$(ID_PREFIX + mappingId).find(".image-cover").css({
				height: (1 - loaded / total) * 100 + "%"
			});
		}
	},
	setImageUrl: function(file, data) {
		var name = typeof file === "string" ? file : file.name;
		var mappingId = fileMap[name];
		if (mappingId) {
			$(ID_PREFIX + mappingId).attr("data-id", data.url).find(".delete").attr("data-id", data.url);
		}
	},
	/**
	 * 预览
	 * @param  {FILE} file 上传的file对象,或者是字符串
	 * @return {[type]}      [description]
	 */
	preview: function(file, callback, defaultShow) {
		for (var i = 0, len = file.length; i < len; i++) {
			var uniqueId = guid();
			var objUrl = "",
				name;
			if (typeof file[i] === "string") {
				name = file[i];
				objUrl = file[i];
			} else {
				name = file[i].name;
				objUrl = getObjectURL(file[i]);
			}
			fileMap[name] = uniqueId;
			this.render(objUrl, uniqueId, defaultShow || false)
		}
		callback && callback();
	},
	bindEvents: function() {
		var me = this;
		/*this.opts.listEl.on("click", ".delete", function() {
			var id = this.getAttribute("data-id"); //获取图片路径
			$(this).closest(".item").remove();
			me.opts.on.deleted.call(me, {
				imgUrl: id
			});
			if (me.data) {
				for (var i = 0, len = me.data.length; i < len; i++) {
					if (id === me.data[i]) {
						me.data.splice(i, 1);
						break;
					}
				}
			}
		});*/
		this.opts.listEl.on("tap", ".item", function(evt) {
			if(!confirm("确定删除吗？")){
				return;
			}
			var id = this.getAttribute("data-id"); //获取图片路径
			$(this).remove();
			me.opts.on.deleted.call(me, {
				imgUrl: id
			});
			if (me.data) {
				for (var i = 0, len = me.data.length; i < len; i++) {
					if (id === me.data[i]) {
						me.data.splice(i, 1);
						if(isWeChat){
							me.WeChatUploadModule.changeCount(me.opts.max - me.data.length,i);
						}
						break;
					}
				}
			}
			
		})
	},
	render: function(src, uniqueId, defaultShow) {
		if (this.opts.on.render) {
			this.opts.on.render.call(this, {
				imgUrl: src,
				index: uniqueId
			});
		} else {
			var html = QTMPL.imageItem.render({
				imgUrl: src,
				index: uniqueId
			});
			this.opts.listEl.append(html);
		}
		if (defaultShow) { //默认有数据的话就直接上传完毕，去掉图片上的蒙层
			this.progress(src, 1, 1);
		}
	},
	removeData: function(url) {

	},
	setData: function(dataList) {
		dataList = dataList || [];
		if (!this.data) {
			this.data = [];
		}
		for (var i = 0, len = dataList.length; i < len; i++) {
			this.data.push(dataList[i].url);
		}
	},
	getData: function() {
		return this.data;
	},
	isWeChat : function(){
		return isWeChat;
	}
}

module.exports = upload