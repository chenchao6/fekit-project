/*
 * 通用简单验证方式
 * 返回值，验证成功返回true,验证失败返回false    
 */

var patternMaps = require('util/pattern.js');
var warnDialog = require("plugins/dialog/warningDialog.js");
function showTip(content){
    dialog = new warnDialog({
        autoHide:true,
        defaultShow: true,
        content: content || ""
    });
}
var simpleValidator = {
    formValid: function (formId,opts) {
        formId=formId || "myform";
        opts=$.extend(opts || {},{
            attrNameByRequire:"require-msg",
            attrNameByError:"error-msg",
            attrNameByPattern:"pattern"
        });
        var inputs;
        inputs = document.getElementById(formId).getElementsByTagName("input");
        for (var i = 0; i < inputs.length; i++) {
            var dom = inputs[i];
            var type = dom.getAttribute("type");
            var requireMsg = dom.getAttribute(opts.attrNameByRequire);
            var isRequire = dom.getAttribute("isRequire");

            if (!type || type == "" || type == "text") {
                if (!dom.value && isRequire) {
                    showTip(requireMsg);
                    return false;
                }
                if (dom.value) {
                    var pattern = dom.getAttribute(opts.attrNameByPattern);
                    if (pattern) {
                        var regStr = /(.*)/;
                        if (patternMaps.hasOwnProperty(pattern)) {
                            regStr = patternMaps[pattern];
                        }
                        if (!regStr.test(dom.value.toString())) {
                            showTip(dom.getAttribute(opts.attrNameByError));
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }
}
module.exports = simpleValidator
