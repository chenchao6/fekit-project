require("plugins/hogan/hogan.js");
require('mustache/common/formInfo.mustache');
//storgeModule
var storageModule = {
    storage: window.localStorage || "",
    maps: ['contact', 'cardId', 'phone'],
    setData: function() {
        var storage = this.storage;
        var maps = this.maps;
        if (storage) {
            for (var i = 0; i < maps.length; i++) {
                storage.setItem(maps[i], $("input[name=" + maps[i] + "]").val() || "")
            }
        }
    },
    init: function() {
        var storage = this.storage;
        var maps = this.maps;
        if (storage) {
            for (var i = 0; i < maps.length; i++) {
                var value = storage.getItem(maps[i]);
                if (value) {
                    $("input[name=" + maps[i] + "]").val(value);
                }
            }
        }
    }
}
var tipDialog = {
    show: function(content) {
        var fWidth, domWidth, $tip, me, timer;
        me = this;
        if (timer) return;
        $tip = this.$tip = $(".cover-error");
        $tip.html(content || "请填写正确信息");
        $tip.removeClass('hide');
        fWidth = $tip.parent().width();
        domWidth = $tip.width();
        $tip.css({ "left": (fWidth - domWidth) / 2 + "px" });
        timer = setTimeout(function() {
            me.hide()
        }, 1000)
    },
    hide: function() {
        this.$tip.addClass('hide');
    }
}


var FormModule = function(opts) {
    this.opts = $.extend({
        el: null,
        data: {}
    }, opts || {});
    this.init();
}
FormModule.prototype = {
    init: function() {
        var me = this;
        var html = QTMPL.formInfo.render();
        this.$container = $(html)
        this.$loading = this.$container.find(".loading");
        //初始化蒙层
        var layer = document.createElement("div");
        layer.className = "overmask hide";
        document.body.appendChild(layer);
        this.$layer = $(layer).html(this.$container);
        this.$list = $("#coupon-list");

        this.$hideBtn = this.$container.find(".sub-btn");
        var timer = null
        $(window).on("scroll resize", function() {
            clearTimeout(timer);
            timer = setTimeout(function() {
                me.$container.css({
                    "-webkit-transform": "translateY(" + ($(window).height() - me.$layer.find(".cover-section").height()) + "px)"
                });
            }, 0);
        });
        me.show();
        storageModule.init();
        this.bindEvents();
    },
    show: function(callback) {
        var me = this;
        this.isShow = true;
        this.$layer.removeClass("hide");
        this.$container.show().addClass("in");
        setTimeout(function() {
            me.$container.css({
                "-webkit-transform": "translateY(" + ($(window).height() - me.$layer.find(".cover-section").height()) + "px)"
            })
        }, 400);
        callback && callback();
    },
    hide: function() {
        this.isShow = false;
        var me = this;
        me.$layer.find('.cover-section').css({
            "-webkit-transform": "translateY(3000px)"
        });
        setTimeout(function() {
            me.$container.hide();
            me.$layer.addClass("hide");
        }, 300);
    },
    bindEvents: function() {
        var me = this;
        $(".sub-btn").click(function() {
            storageModule.setData();
            // me.hide();
            if (me.formValid()) {
                me.hide();
            }
        })
        $(".J-close").click(function() {
            me.hide();
        })
    },
    formValid: function() {
        var inputs;
        inputs = document.getElementById("userInfo").getElementsByTagName("input");
        for (var i = 0; i < inputs.length; i++) {
            var dom = inputs[i];
            var type = dom.getAttribute("type");
            var placeholder = dom.getAttribute("placeholder");
            if (!type || type == "" || type == "text") {
                if (!dom.value) {
                    tipDialog.show('请填写' + placeholder);
                    return false;
                }
                if (dom.value) {
                    var pattern = dom.getAttribute("pattern");
                    var reg = new RegExp(pattern);
                    if (!reg.test(dom.value)) {
                        tipDialog.show(dom.getAttribute("error-msg"));
                        return false;
                    }

                }
            }
        }
        return true;
    }
}

module.exports = FormModule
