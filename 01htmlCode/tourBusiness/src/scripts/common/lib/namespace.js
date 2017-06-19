/**
 * @description 命名空间
 **/
(function(){
	var arrayEach  = Array.prototype.forEach;
	var ns = function (name) {
	    var part = global,
	        parts = name && name.split('.') || [];

	    parts.forEach(function (partName) {
	        if (partName) {
	            part = part[ partName ] || ( part[ partName ] = {});
	        }
	    });

	    return part;
	};
	$ = window.$ ||{}; 
	window.namespace = $.namespace = function(path , params){
	    var lastIndex = path && path.lastIndexOf('.') || -1;
	    return ns(lastIndex === -1 ? null : path.substr(0, lastIndex))[ path.substr(lastIndex + 1) ] = params;
	};
})()
