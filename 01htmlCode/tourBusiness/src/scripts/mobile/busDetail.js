/**
 * Created by xiaochao on 2017/4/10.
 */
var Cfg = require("./config.js");
require("plugins/hogan/hogan.js");
require("plugins/datetime/index.js");
var miniView = require("plugins/miniView/miniView.js");
var warnDialog = require("plugins/dialog/warningDialog.js");
var formModule = require("./modules/formInfo.js");
var QueryString = require("util/parameterPaser.js");
var urlParams = QueryString.parseQueryString(location.search);
var dialog=null;
var dId=urlParams.dId || 2;
function showTip(content){
    dialog = new warnDialog({
        autoHide:true,
        defaultShow: true,
        content: content || "请至少选择一种票类"
    });
}



//变量
var $btnBook =$(".btn-book");
var $calculate =$(".calculate");
var $total =$(".total-price");
var Page = {
    init: function() {
        this.bindEvent();
        this.orderInfo={};
        this.getDetail();
    },
    bindEvent: function() {
       var me = this;
       $btnBook.click(function(){
          if(!me.checkNum())
          return showTip();
          if(this.formIntance){
            this.formIntance.show();
            return;
          }
          this.formIntance = new formModule();
       })
       //计算器
       $calculate.on("click",'.add,.del',function(){
          var $target = $(this),MAX_NUM=10,MIN_NUM=0;
          var $input =$target.siblings(".type-input");
          var num =$target.hasClass('add')?Math.min(~~$input.val()+1,MAX_NUM):Math.max(~~$input.val()-1,MIN_NUM);
          $input.val(num);  
          me.reCountPrice();
       })
    },
    //重新计算价钱
    reCountPrice:function(){
       var totalPrice = 0 ;
       $.each($(".type-input"),function(n,item){
          var num = $(item).val();
          var price = $(item).data('price');
            totalPrice=totalPrice+num*parseFloat(price).toFixed(2);
       })
       $total.html(totalPrice);
    },
    //检查有无数量
    checkNum:function (){
        var inputs= $(".type-input");
        var count = 0 ;
        $.each(inputs,function(n,item){
           count+=~~item.value;
        })
        console.log(count);
        return count>0;
    },
    getDetail:function(){
       $.ajax({
            url: Cfg.urls.GET_PLACE_LIST,
            data: {
                key: "search-scheduleDetail",
                drive_id:dId
            },
            success: function(result) {
                // var result ={"status":true,"code":200,"content":[{"arrive_time":"09:30","schedule_id":1,"schedule_name":"小牛巴士一号线","adult_seat":29,"departure_time":"08:00","route":"遵义集散中心-汕头路口-新舟机场","stock_id":1,"drive_id":2,"ticket_code":1}]}
                console.log(result);
            }
        })
    }
}
Page.init();
