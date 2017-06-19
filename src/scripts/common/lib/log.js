var LOG_URL = "/midea-weixin/log/log.json"

queryToString = function(data){
	var str = [];
	for(var i in data){
		str.push(i+"="+data[i]);
	}
	return str.join("&");
}

var logJs = {
	log : function(data){
		var xhr = new XMLHttpRequest();
		xmlhttp.open("GET",LOG_URL,true);
  		xmlhttp.send(null);
	},
	formatUrl : function(data){
		var str = LOG_URL;
		var dataStr = queryToString(data);
		return str + "?" + dataStr;
	}
}

window.logJs = logJs;