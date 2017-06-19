require("../core.js");
;(function(){
	var ISCHINESE = /[\u4e00-\u9fa5]/;

	var getData =  function( value , maxLenth , isStrick ){
		value = value + '';
		var total = 0 , legelIndex = value.length;
		if( !isStrick ){ 
			return {
				total : legelIndex ,
				index : legelIndex
			};
		}
		for( var i = 0 , len = value.length ;i  < len ; i ++ ){
			var key = value.charAt( i );
			total += ISCHINESE.test(key) ? 2 : 1;
			maxLenth && total <= maxLenth &&( legelIndex = i+1 );
		}
		return {
			total : total ,
			index : legelIndex
		};
	}


	/**
	 * 根据要求的最大值，返回合法
	 * @param  {[type]}  value    需要检查的字符串
	 * @param  {[type]}  maxLength   校验字符串的最大长度
	 * @param  {Boolean} isStrick 是否要求中文算两个字符
	 * @return {[type]}           返回字符串的长度
	 */
	String.prototype.getLegalLengthValue = function(maxLenth , isStrick ){
		var data = getData(this, maxLenth, isStrick);
		return this.substring( 0 , data.index );
	}

	String.prototype.getLength = function(isStrick ){
		var data = getData(this, false, isStrick);
		return data.total;
	}
})();