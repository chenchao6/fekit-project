var httpRequest = {
	ajax: function (options,callback) {
		options = options || {};
		$.ajax({
			url:options.url,
			data:options.data,
			success: function (result) {
			  	if(result.status){

				}else{
					console.log("系统有误:"+data);
				}
			}
		})
	}
}
module.exports = httpRequest