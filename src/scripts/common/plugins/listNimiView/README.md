省市联动的插件，例子后续补充 

var instance = new listNimiView(el, {
	url: null, //获取数据的url
	tmpl: null, //填充数据列表的模板
	listSelector: null, //列表元素的选择器
	name: "", //是省份还是市还是区还是县
	on: {
		selected: noop,
		render : noop,
		getData:function(){//如果url是null的话必须填写要有这个方法，
			return Object Or Array 返回数据或者对象
		}
	}
}, opts);