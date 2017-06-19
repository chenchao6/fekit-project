/**
 * @description 
 * 这个负责loading数据，并进行渲染的
 * 依赖库QNR.Util.template , Qclass
 * 初始化需要传递参数
 * opts.baseUrl : 加载数据的URL
 * opts.container :数据展示的容器
 * opts.data  : 需要传递的参数
 **/
var defaultConfig = {
    pageSize: 10,
    pageIndex: 0
}

var Grid = function(opts) {
    opts = opts || {};
    this.opts = $.extend(true, {
        container: null,
        key: "orders",
        data: {
            pageSize: 10,
            pageIndex: 0
        },
        emptyEachTime: true,
        defaultShow: true,
        pageEl: $('#pager')
    }, opts);

    this.properities = opts.data || defaultConfig;

    if (this.opts.pager) {
        this.pager = this.opts.pager;
    }
    this.cacheData = null;
    return this;
}

Grid.prototype = {
    load: function(param, renew) {
        if (renew) {
            this.reset();
        }
        if (this.opts.before) {
            this.opts.before.call(this);
        }
        if (this.ajaxHandler) {
            this.ajaxHandler.abort();
        }
        $.extend(this.properities, param || {}, {
            _V: (new Date).getTime()
        });
        this.ajaxHandler = $.getJSON(this.opts.baseUrl, this.properities, $.proxy(function(data) {
            if (data && data.status) {
                this.loaded = true;
                this.cacheData = data;
                this.renderData(data);
            } else {
                this.empty();
                this.opts.error && this.opts.error.call(this, data);
            }
        }, this)).fail($.proxy(function(data) {
            this.opts.error && this.opts.error(data);
        }, this));
    },
    reset: function() {
        this.properities = {
            pageSize: this.opts.data.pageSize,
            pageIndex: 0
        }
    },
    setUrl: function(url) {
        this.opts.baseUrl = url;
    },
    empty: function() {
        this.opts.container.empty();
        this.opts.pageEl.addClass('hide');
        this.reset();
    },
    hasData: function() {
        return this.cacheData && this.cacheData.data && this.cacheData.data.content;
    },
    param: function(data) {
        var q = {},
            k = [],
            i = 0;
        if (!!data && typeof data == "object") {
            for (var i in data) {
                k.push(i + "=" + data[i]);
            }
            return k.join('&');
        }

        if (typeof data == "string") {
            k = data.split('&');
            for (len = k.length; i < len; i++) {
                var p = split('=');
                if (p && p.length) {
                    q[p[0]] = p[1];
                }
            }

            return q;
        }

        return q;
    },
    renderData: function(data) {
        var self = this;
        this.opts.container[this.opts.emptyEachTime ? "html" : "append"](this.opts.render.call(this, data, this.properities.pageIndex));

        if (data && data.content && data.content[this.opts.key]) {
            this.pager(data.content.totalCount || 0);
        } else {
            this.opts.pageEl.addClass("hide"); //在没有数据的情况下隐藏分页
        }
        //外部调用接口，格子渲染完毕后需要做的事情
        this.opts.rendered && this.opts.rendered.call(this, data);
    },
    pager: function(rows) {

        var me = this,
            properities = this.properities;
        this.totalPageNum = rows % this.properities.pageSize == 0 ? rows % this.properities.pageSize : ~~(rows / this.properities.pageSize) + 1;
        if (this.totalPageNum === properities.pageIndex + 1) {
            this.opts.pageEl.addClass("hide").find(".txt").text("加载更多");
        } else {
            this.opts.pageEl.removeClass("hide").find(".txt").text("加载更多");
        }
        rows = rows || 0;
        this.pagers = this.opts.pageEl.unbind().bind("click", function() {
            $(this).find(".txt").text("正在加载中...");
            if (properities.pageIndex + 1 < me.totalPageNum) {
                me.properities.pageIndex++;
                me.load();
            } else {
                //已经是最后一页
                me.pagers.hide();
            }
        });
    }
}

module.exports = Grid;