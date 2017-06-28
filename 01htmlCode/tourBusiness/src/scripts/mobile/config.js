var DateUtil = require("util/Base64.js");
var isDebug = false;
var Cfg = (function() {

	var ENV = (function() {
		if (location.href.indexOf('http://localhost') == 0 || location.href.indexOf('http://127.0.0.1') == 0) {
			return "LOCAL";
		} else {
			return "PRD";
		}
	})();

	var Config = {
		LOCAL: {
			interFacePrefix: "/"   //http://www.weibunet.com
		},
		PRD: {
			interFacePrefix: "/"
		}
	};

	return Config[ENV];

})()


window.onerror = function() {
	if (isDebug) {
		alert(JSON.stringify(arguments));
	}
};

var urls = {
	"GET_PLACE_LIST": Cfg.interFacePrefix + "public/getList", //获取列表
	"SET_INSERT":Cfg.interFacePrefix + "public/setInsert"
};


module.exports = {
	Cfg: Cfg,
	urls: urls,
	emptyHtml:'<p class="txt-center">暂无数据</p>'
};