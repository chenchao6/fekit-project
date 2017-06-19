var fs = require("fs");
var path = require("path");
var targetPath = path.resolve(__dirname, "../src/html");
var newPath = path.resolve(__dirname, "../html/");
var map = {}
for (var i = 0, len = EXPORT_LIST.length; i < len; i++) {
	map[EXPORT_LIST[i].path] = EXPORT_LIST[i]
}

var time = new Date().getTime();

console.log(EXPORT_LIST)
var REGEX = /\?version/g

function changeJs(filePath, data) {
	/*console.log(filePath);
	console.log(data)
	for(var i in map){
		console.log(data.match(i));
	}*/
}

function changeHtml(filePath, data) {

}

function changeHtmlJsOrCssFile(filePath, data) {
	console.log("changeHtmlJsOrCssFile")
	console.log()
	data = data.replace(REGEX, "?"+time)
	console.log(path.extname(filePath))
	var paths = newPath + "/" + path.basename(filePath);
	/*if (!fs.exists(paths)) {
		mkdirp.sync(syspath.dirname(paths));
	}*/
	console.log(paths)
	return fs.writeFileSync(paths, data);
}
var files = fs.readdirSync(targetPath);
for (var i = 0; i < files.length; i++) {
	(function() {
		var filePath = path.normalize(targetPath + "/" + files[i]);
		var stat = fs.statSync(filePath);
		if (stat.isFile()) {
			data = fs.readFileSync(filePath, "utf-8");
			changeHtmlJsOrCssFile(filePath, data.toString());
		}
	})();
}