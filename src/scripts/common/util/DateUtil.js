    var DateUtil = {
        oneday: 24 * 60 * 60 * 1000,
        today: function() {
            var t = new Date();
            return new Date(t.getFullYear(), t.getMonth(), t.getDate());
        },
        format: function(date1) {
            date1 = this.parse(date1);
            if (!!date1) {
                var arr = DateUtil.toArr(date1);
                return arr.join("-");
            }
        },
        toArr: function(date) {
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            if (m < 10) {
                m = "0" + m;
            }
            var d = date.getDate();
            if (d < 10) {
                d = "0" + d;
            }

            return [y, m, d];
        },
        addDay: function(day, num) {
            return new Date(day.getTime() + (DateUtil.oneday * num));
        },
        getFirstByMonth: function(date) {
            return new Date(date.getFullYear(), date.getMonth(), 1);
        },
        getLastByMonth: function(date) {
            var nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
            return DateUtil.addDay(nextMonth, -1);
        },
        parse: function(dateStr) {
            if (dateStr instanceof Date) {
                return dateStr;
            } else if (/^\d+$/.test(dateStr)) {
                return new Date(parseInt(dateStr, 10));
            } else {
                var dateString = dateStr.replace(/[-:]/g, ',').replace(/\s+/g,",");
                var dateArr = dateString.split(",");
                return new Date(dateArr[0],dateArr[1]-1,dateArr[2],dateArr[3] || 0, dateArr[4] || 0,dateArr[5] || 0);
            }
        },
        formatyymmddhhmmss: function(date) {
            if (!!date) {
                if (/^\d+$/.test(date)) {
                    date = new Date(parseInt(date, 10));
                } else if (typeof date == "string") {
                    date = new Date(Date.parse(date.replace(/-/g, '/')));
                }
                var str = this.format(date);
                var h = date.getHours();
                var m = date.getMinutes();
                var s = date.getSeconds();
                str += " " + (h < 10 ? '0' + h : h) + ":" + (m < 10 ? '0' + m : m) + ":" + (s < 10 ? '0' + s : s);
                return str;
            }
        },
        formathhmmss: function(date) {
            if (!!date) {
                if (/^\d+$/.test(date)) {
                    date = new Date(parseInt(date, 10));
                } else if (typeof date == "string") {
                    date = new Date(Date.parse(date.replace(/-/g, '/')));
                }
                var h = date.getHours();
                var m = date.getMinutes();
                var s = date.getSeconds();
                var str = (h < 10 ? '0'+h : h) + ":" + (m < 10 ? '0'+m : m) + ":" + (s < 10 ? '0'+s : s);
                return str;
            }
        },
        toDateObject: function(date) {
            if (!!date) {
                if (/^\d+$/.test(date)) {
                    date = new Date(parseInt(date, 10));
                } else if (typeof date == "string") {
                    date = new Date(Date.parse(date.replace(/-/g, '/')));
                }

                return {
                    year : date.getFullYear(),
                    month : date.getMonth()+1,
                    day : date.getDate(),
                    hour : date.getHours(),
                    minute : date.getMinutes(),
                    second : date.getSeconds()
                }
            }
        },
        formatmmddhhmmss: function(date) {
            var str = this.formatyymmddhhmmss(date);
            return str.replace(/\d{4}-/, '');
        },
        formatLocalyymmddhhmmss: function(date) {
            var str = "";
            dateObject = this.toDateObject(date);
            if (!!dateObject) {
                str += dateObject.year + "年" + dateObject.month + "月" + dateObject.day + "日" + (dateObject.hour < 10 ? '0' + dateObject.hour : dateObject.hour) + "时" + (dateObject.minute < 10 ? '0' + dateObject.minute : dateObject.minute) + "分" + (dateObject.second < 10 ? '0' + dateObject.second : dateObject.second) + "秒";
                return str;
            }
        },
        formatmmddhhmmss: function(date) {
            var str = "";
            dateObject = this.toDateObject(date);
            if (!!dateObject) {
                str += dateObject.month + "-" + dateObject.day + " " + (dateObject.hour < 10 ? '0' + dateObject.hour : dateObject.hour) + ":" + (dateObject.minute < 10 ? '0' + dateObject.minute : dateObject.minute) + ":" + (dateObject.second < 10 ? '0' + dateObject.second : dateObject.second);
                return str;
            }
        }
    };

module.exports = window.DateUtil = DateUtil;