此文件用于构造类似APP的左右切屏或者上下切屏想过
例子:
	var view = new miniView({
		el : //当前要滑动的界面
		direction : 'left' //滑动方向,支持left/top
		distance : //每次展示的时候滑动的距离,如果不传递则默认滑动距离为整屏幕的宽度或者高度（取决于direction）
		on : {
			showed : function(){//当页面展开完毕之后需要处理的回调函数

			},
			hided : function(){}//当页面隐藏之后处理的回调函数
		}
	})