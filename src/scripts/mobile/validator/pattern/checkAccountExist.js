$.jvalidator.addPattern({
	name: "isExistAccountData",
	message: "账号不存在，请重新确认",
	validate: function(value, callback) {
		$.ajax({
			url : "/littleswan/passportAction/isExistMemberAccount",
			data : {
				account : $.trim(value),
				_V : (new Date()).getTime()
			},
			async : false
		}).done(function(result){
			var data = result.content || {};
			callback(data.exist);
		})
	}
});