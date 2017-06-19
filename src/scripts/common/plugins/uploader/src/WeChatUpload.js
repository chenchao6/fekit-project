var weChatMideaModule = function(el,opts){
	if(el && el.length){
		this.el = el[0];
	}else{
		this.el = el;
	}
	this.opts = $.extend(true,{
		count : 3,
		max : 3,
		url : "/midea-weixin/downLoad/weixinFile",
		on : {
			success : function(){},
			failure : function(){},
			preview:function(){},
			failure : function(){}
		}
	},opts);
	this.localIds = [];

	this.init();
}

weChatMideaModule.prototype = {
	init : function(){
		var me = this;
		this.el.addEventListener("click", function(evt){
			if(me.localIds.length < me.opts.max){
				me.callWeChatUpload();
			}else{
				me.opts.on.failure("MAX");
			}
		},false);
	},
	callWeChatUpload : function(){
		var me = this;
		wx.chooseImage({
		    count: this.opts.count, // 默认9
		    sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
		    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
		    success: function (res) {
		        var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
	   			if(!me.localIds){
	   				me.localIds = [];
	   			}
	   			me.localIds.push.apply(me.localIds, localIds);
	   			me.opts.on.preview(localIds,me.localIds);
		   		me.weixinUpload(localIds,function(ids){
		   			me.opts.on.success(localIds,ids);
		   			//me.downLoadWeiXinFile(ids);
		   		});
		    }
		});
	},
	weixinUpload: function(localIds,callback) {
		var len = localIds.length,result = [], i = 1;
		var syncUpload = function(id){
			wx.uploadImage({
			    localId: id, // 需要上传的图片的本地ID，由chooseImage接口获得
			    isShowProgressTips: 1, // 默认为1，显示进度提示
			    success: function (res) {
			        result.push(res.serverId); // 返回图片的服务器端ID
			        if(!localIds[i]){
			        	callback && callback(result);
			        }else{
			        	syncUpload(localIds[i++])
			        }
			    }
			});
		}
		syncUpload(localIds[0]);
	},
	//在微信端拉取,暂时不用，前端调取接口拉图片比较慢
	downLoadWeiXinFile: function(ids){
		var me = this;
		$.ajax({
			url : this.opts.url,
			data : {mideaIdArry: ids.join(",")},
			dataType : "json",
			type : "POST",
			success : function(result){
				if(result.status){
					me.opts.on.success(me.localIds,result);
				}
			},
			error : function(xhr, e){
				me.opts.on.failure(e);
			}
		})
	},
	/**
	 * [changeCount description]
	 * @param  {[type]} count 设置最大值
	 * @param  {[type]} index 删除的索引，在删除操作的时候才有
	 * @return {[type]}       [description]
	 */
	changeCount: function(count, index){
		this.opts.count = count;
		if(typeof index!=="undefined"){
			this.localIds.splice(index,1);
		}
	}
}

module.exports = weChatMideaModule;