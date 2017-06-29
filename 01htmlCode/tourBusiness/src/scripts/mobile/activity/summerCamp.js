/**
 * Created by xiaochao on 2017/4/10.
 */
var Cfg = require("../config.js");
require("plugins/hogan/hogan.js");
require("plugins/datetime/index.js");
var miniView = require("plugins/miniView/miniView.js");
var warnDialog = require("plugins/dialog/warningDialog.js");
var simpleValidator = require("plugins/validator/simpleValidator.js");
var QueryString = require("util/parameterPaser.js");
var urlParams = QueryString.parseQueryString(location.search);
var dialog=null;
var dId=urlParams.dId || 2;
function showTip(content){
    dialog = new warnDialog({
        autoHide:true,
        defaultShow: true,
        content: content || ""
    });
}

var Page = {
    init: function() {
        this.bindEvent(); 
    },
    bindEvent: function() {
       var self = this;
       $(".btn-submit").click(function(){
          if(self.formValid()){
              self.submit();
          }  
       })
    },
    formValid: function() {
       return simpleValidator.formValid('userInfo');
    },
    submit:function(){
      var params ={
        key: "insert-summerCamp"
      };
      params = $.extend(params,QueryString.parseQueryString($("#userInfo").serialize()));
      if(!$(".btn-submit").attr('isdo')){
            $.ajax({
                url: Cfg.urls.SET_INSERT,
                data:params,
                type:"post",
                success: function(result) {
                    // var result ={"status":true,"code":200,"content":[{"arrive_time":"09:30","schedule_id":1,"schedule_name":"小牛巴士一号线","adult_seat":29,"departure_time":"08:00","route":"遵义集散中心-汕头路口-新舟机场","stock_id":1,"drive_id":2,"ticket_code":1}]}
                    if(result.status){
                       $(".btn-submit").text('提交成功').attr("isdo",1);
                    }else{
                       showTip(result.content || '已经提交过啦');  
                    }
                }
            })
      }else{
          showTip('已经提交过啦');
      }
     
    }
}
Page.init();
