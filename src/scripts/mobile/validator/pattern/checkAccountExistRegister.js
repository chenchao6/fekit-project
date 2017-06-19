$.jvalidator.addPattern({
	name: "isExistAccount",
	message: "您的账号已经注册了，请点击登录",
	validate: function(value, callback) {
		$.ajax({
			url : "/littleswan/passportAction/isExistMemberAccount",
			data : {
				account : $.trim(value),
				_V : (new Date()).getTime()
			},
			async : false
		}).done(function(result){
			var data = (result && result.content) || {};
			callback(!data.exist, data.hint || null);
		})
	}
});