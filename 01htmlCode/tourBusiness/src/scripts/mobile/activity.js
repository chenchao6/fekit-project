/**
 * Created by xiaochao on 2017/4/10.
 */
var Cfg = require("./config.js");
require("plugins/hogan/hogan.js");
require("plugins/datetime/index.js");
var miniView = require("plugins/miniView/miniView.js");
var warnDialog = require("plugins/dialog/warningDialog.js");
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
        var patternMaps = {
            content:"^[a-zA-Z0-9\u4e00-\u9fa5]+$",
            int:"^[0-9]*$",
            phone:"^[0-9]\d{10}$"
        };
        var inputs;
        inputs = document.getElementById("userInfo").getElementsByTagName("input");
        for (var i = 0; i < inputs.length; i++) {
            var dom = inputs[i];
            var type = dom.getAttribute("type");
            var requireMsg = dom.getAttribute("require-msg");
            var isRequire = dom.getAttribute("isRequire");
           
            if (!type || type == "" || type == "text") {
            if (!dom.value && isRequire) {
                showTip(requireMsg);
                return false;
            }
            if (dom.value) {
                var pattern = dom.getAttribute("pattern");
                if(pattern){
                    var regStr = "";
                    if(patternMaps.hasOwnProperty(pattern)){
                       regStr=patternMaps[pattern];
                    }
                    var reg = new RegExp(regStr);
                    if (!reg.test(dom.value)) {
                        showTip(dom.getAttribute("error-msg"));
                        return false;
                    }
                }
            }
            }
            
            
        }
        return true;
    },
    submit:function(){
      var params ={
        key: "search-scheduleDetail"
      };
      Object.assign(params,QueryString.parseQueryString($("#userInfo").serialize()));
      if(!$(".btn-submit").attr('isdo')){
            $.ajax({
                url: Cfg.urls.GET_PLACE_LIST,
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
