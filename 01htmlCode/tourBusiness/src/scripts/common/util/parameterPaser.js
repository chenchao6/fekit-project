var queryString = {
	parseQueryString: function(param) {
		var reg = /([^\?|\&]\w+)=([^\?|\&]+)/ig;
		var v = {};
		if (param) {
			if (param.charAt(0) == "?") param = param.substr(1);
			while (true) {
				if ((r = reg.exec(param))) {
					v[r[1]] = decodeURIComponent(r[2]);
				} else {
					break;
				}
			};
		}
		return v;
	},
	/*
	 *@param {Object} param : an object
	 *@param {String} splitKey : 组合的key, 默认是&
	 */
	parseToString: function(param, splitKey) {
		var arr = [];
		param = param || {},
			splitKey = splitKey || "&";
		for (var i in param) {
			arr.push(i + "=" + param[i]);
		}
		return arr.join(splitKey);
	}
}
module.exports = queryString