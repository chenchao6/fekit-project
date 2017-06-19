var noop = function(){}
var upload = function(args) {
	this.opts = $.extend({
		fileInput: null, //html file 控件
		dragDrop: null, //拖拽放置区域
		upButton: null, //提交按钮		
		uploadUrl: '', //ajax地址	
		allowExist: false,
		type : "image",
		max : false,
		selectedFiles: [], //过滤后的文件数组
		on : {
			filter: function(file) { //选择文件组的过滤方法
				var arr = [];
				for (var i = 0, len = file.length; i < len; i++) {
					arr.push(file[i]);
				}
				return arr;
			},
			change : noop,//选择改变之后
			checkAfterFilter :  noop,//上传之前
			'dragleave' : noop,//文件离开敏感区域时
			'progress' : noop,//文件上传进度
			'success' : noop,//文件上传成功时
			'failure' : noop,//文件上传失败时
			'complete' : noop,//文件全部上传完毕
			'dragOver' : noop//文件拖拽到敏感区域时
		}
	}, args);

	this.init();
};

$.extend(upload.prototype, {

	init: function() {
		var me = this;

		if (this.opts.dragDrop) {
			this.opts.dragDrop.addEventListener("dragover", function(e) {
				me.dragHover(e);
			}, false);
			this.opts.dragDrop.addEventListener('dragleave', function(e) {
				me.dragHover(e);
			}, false);
			this.opts.dragDrop.addEventListener("drop", function(e) {
				var files = me.getFiles(e);
				me.opts.on.change(files, function(fileResult){
					me.getFilesAndDeal(fileResult);
				})
			}, false);
		}

		if (this.opts.fileInput) {
			this.opts.fileInput.addEventListener("change", function(e) {
				var files = me.getFiles(e);
				me.opts.on.change(files, function(fileResult){
					me.getFilesAndDeal(fileResult);
				})
			}, false);
		}

		if (this.opts.upButton) {
			this.opts.upButton.addEventListener("click", function(e) {
				me.uploadFile(e);
			}, false);
		}
	},
	getFiles: function(e){
		var file = e.target.files || e.dataTransfer.files;
		return file;
	},

	//文件拖放
	dragHover: function(e) {
		e.stopPropagation();
		e.preventDefault();
		this.opts.on[e.type === 'dragover' ? "dragover" : "dragleave"].call(e.target);
		return this;
	},

	//获取选择文件
	getFilesAndDeal: function(file) {
		file = this.opts.selectedFiles = this.opts.on.filter(file);
		this.dealFiles();
		return this;
	},

	//选中文件的处理与回调
	dealFiles: function() {
		var i = 0;
		for (var file; file = this.opts.selectedFiles[i]; i++) {
			file.index = i;
		}
		this.uploadFile();
		return this;
	},

	//文件上传
	uploadFile: function() {
		var me = this,
			i = 0,
			length = this.opts.selectedFiles.length,
			file;
		for (; i < length; i++) {
			file = this.opts.selectedFiles[i];

			var fd = new FormData();
			// fd.append("pId", this.opts.uploadData);
			fd.append("file", file);
			(function(file) {
				var xhr = new XMLHttpRequest();
				if (xhr.upload) {
					//上传中
					xhr.upload.addEventListener("progress", function(evt) {
						me.opts.on.progress(file, evt)
					}, false);

					xhr.onreadystatechange = function(e) {
						if (xhr.readyState === 4) {
							if (xhr.status === 200) {
								var result = JSON.parse(xhr.responseText)
								me.opts.on.success(file, result);
								if (!me.opts.selectedFiles.length) {
									me.opts.on.complete();
								}
							} else {
								me.opts.on.fail(file, result);
							}
						}
					};
					xhr.open('POST', me.opts.uploadUrl, true);
					xhr.setRequestHeader('enctype', 'multipart/form-data');
					xhr.send(fd);
				}
			})(file);
		}
	}
});

module.exports = upload;