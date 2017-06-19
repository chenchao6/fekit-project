var warnDialog = require("plugins/dialog/warningDialog.js");
var dialog=null;
function showTip(content){
    dialog = new warnDialog({
        autoHide:true,
        defaultShow: true,
        content: content || "请填写内容"
    });
}
window.showTip=showTip;






