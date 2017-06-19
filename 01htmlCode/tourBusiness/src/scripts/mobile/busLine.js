/**
 * Created by xiaochao on 2017/4/10.
 */
var Cfg = require("./config.js");
require("plugins/hogan/hogan.js");
require("./mustache/busLine/list.mustache");
require("./mustache/busLine/hot.mustache");
require("./mustache/busLine/station.mustache");
require("./mustache/busLine/stationList.mustache");
require("plugins/datetime/index.js");
var QueryString = require("util/parameterPaser.js");
var miniView = require("plugins/miniView/miniView.js");
var $selectDate = $(".item-mdate");

var $group = $(".J-group");
var $beginStation = $(".J-begin-station");
var $endStation = $(".J-end-station");

//出发目的地 选择模块
var stationModule = {
    init: function() {
        this.setMiniView();
        this.instance = {}
    },
    setMiniView: function() {
        var me = this;
        me.viewInstance = null;
        me.viewInstance = new miniView({
            el: $(".J-station-container"),
            title: "出发点选择",
            hidedAndRemove: true,
            tpl: QTMPL.station,
            on: {
                showed: function() {
                    //绑定事件
                    me.showed();
                },
                hided: function() {

                }
            }
        })
        $beginStation.on('click', function() {
            me.keyName = "begin";
            me.viewInstance.show();
        })
        $endStation.on('click', function() {
            me.keyName = "end";
            me.viewInstance.show();
        })
    },
    showed: function() {
        var me = this;
        $(this.viewInstance.el).on('click', ".station-item li", function() {
            var $li = $(this);
            me.selectData("", $li.html());
        })
        me.setData();
    },
    selectData: function(code, name, callBack) {
        $target = this.keyName == "begin" ? $beginStation : $endStation;
        $target.attr("data-code",code);
        $target.children().last().html(name);
        this.viewInstance.hide();
        callBack && callBack();
    },
    setData: function() {
    
        var me = this;
        var TPL = '<li class="current" data-code="">全部</li>';

        $.ajax({
            url: Cfg.urls.GET_PLACE_LIST,
            data: {
                key: "search-placeList"
            },
            success: function(result) {
                var content = me.dataList = result.content || [];
                var mainData = [];
                $.each(content, function(i, vd) {
                    if (!mainData.length) {
                        mainData.push(vd.area_code);
                        TPL += '<li data-code="{0}">{1}</li>'.replace('{0}', vd.area_code).replace('{1}', vd.aname);
                    } else {
                        if (mainData.join('').indexOf(vd.area_code) == -1) {
                            mainData.push(vd.area_code);
                            TPL += '<li data-code="{0}">{1}</li>'.replace('{0}', vd.area_code).replace('{1}', vd.aname);
                        }
                    }
                })
                $(me.viewInstance.el).find(".country-container").html(TPL).on("click", "li", function() {
                    var $li = $(this);
                    $li.addClass("current").siblings().removeClass('current');
                    me.refleshList($li.data("code"));
                });
                me.renderHot(content);
                me.renderStationItems(content);
            }
        })
    },
    refleshList: function(id) {
        if (!id) {
            this.renderStationItems(this.dataList);
            return;
        }
        var result = this.dataList.filter(function(item) {
            return item.area_code == id;
        })
        this.renderStationItems(result);
    },
    //热门地点
    renderHot: function(content) {
        var me = this;
        var sortResult = content.sort(function(a, b) {
            return a.hot > b.hot;
        });
        $(".hot-container").html(QTMPL.hot.render({ data: sortResult })).on("click", 'li', function() {
            var $li = $(this);
            me.selectData($li.data('code'), $li.html());
        })
    },
    //地点
    renderStationItems: function(content) {
        //按照首字母排序
        var sortResult = content.sort(function(a, b) {
            return a.rome > b.rome;
        });
        var wrapData = [];
        $.each(sortResult, function(i, vd) {
                var obj = {
                    rome: vd.rome,
                    list: []
                };
                $.each(sortResult, function(j, sr) {
                    if (sr.rome == vd.rome) {
                        obj.list.push({ place_id: sr.place_id, pname: sr.pname });
                    }
                })
                if (!wrapData.length) {
                    wrapData.push(obj);
                } else {
                    var count = 0;
                    for (var i = 0; i < wrapData.length; i++) {
                        if (wrapData[i].rome == obj.rome) {
                            count++;
                        }
                    }
                    if (!count) wrapData.push(obj);
                }

            })
            //渲染数据
        var html = QTMPL.stationList.render({ data: wrapData });
        $(".J-station-item").html(html);
    },

    bindEvent: function() {

    }
}


var Page = {
    init: function() {
        this.bindEvent();
        this.getRecommond();
    },
    bindEvent: function() {
        $selectDate.mdater();

        stationModule.init();
        this.jumpTo();
    },
    jumpTo:function(){
        $(".btn-search").click(function(evt){
           evt.stopPropagation();
           evt.preventDefault();
           var params =QueryString.parseToString({
             departureId:~~$beginStation.data('code'),
             arriveId:~~$endStation.data('code'),
             date:$('#selectTime').val()
           })
           window.location.href="/html/busList.html?"+params;
        })
    },
    getRecommond: function() {
        //todo 获取后端接口
        var mockList = [{
            desc: "桃花盛开 | 九寨沟3日纯玩套餐（舒适酒店2晚+九寨沟门票、观光车）",
            imgUrl: "/images/pic1.jpg"
        }, {
            desc: "迎春踏青 | 都江堰、青城山1日往返畅玩套餐（含门票）",
            imgUrl: "/images/pic2.jpg"
        }, ];
        var tpl = QTMPL.list.render({
            list: mockList || []
        });
        $group.html(tpl);
    }
}
Page.init();
