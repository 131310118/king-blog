/**
 * Created by wangj on 2016/9/29.
 */

var cookie = {
    setCookie: function(key, value, exp){
        var d = new Date();
        exp = exp || 86400000;
        var str = key + '=' + value + ';expires=' + d.setDate(d.getTime()+exp);
        document.cookie = str;
    },
    getCookie: function(key) {
        var reg = new RegExp("(^| )"+key+"=([^;]*)(;|$)");
        var name = document.cookie.match(reg);
        if(name != null) {
            return name[2];
        } else {
            return false;
        }
    },
    removeCookie: function(key) {
        cookie.setCookie(key,cookie.getCookie(),-1);
    }
};

var xhr = {
    formatParam: function (data){
        var arr = [];
        var str = '';
        for(var name in data){
            if(data[name] instanceof Array && data[name].constructor == Array) {
                for(var i = 0; i < data[name].length; i++) {
                    str += '&' + name + '=' + encodeURIComponent(data[name][i]);
                }
            } else {
                arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
            }
        }
        if(arr.length) {
            return arr.join('&') + str;
        } else {
            return str.substring(1);
        }
    },
    ajax: function(option) {
        var x = new XMLHttpRequest();
        if(option.type.toLowerCase() == 'get') {
            if(option.data) {
                x.open('get', option.url + '?' + xhr.formatParam(option.data), true);
            } else {
                x.open('get', option.url, true);
            }
            x.send();
        } else if(option.type.toLowerCase() == 'post') {
            x.open('post', option.url, true);
            xhr.setHeader(x, {"Content-Type": "application/x-www-form-urlencoded"});
            xhr.setHeader(x, option.header);
            x.send(xhr.formatParam(option.data));
        }
        x.onreadystatechange = function () {
            if(x.readyState == 4) {
                if(x.status == 200) {
                    var res = x.response;
                    if(option.dataType && option.dataType.toLowerCase() == 'json') {
                        res = JSON.parse(x.response);
                    }
                    option.success && option.success(res);
                } else {
                    option.error && option.error(x);
                }
                option.complete && option.complete(x)
            }
        }
    },
    setHeader: function(x,obj) {
        if(obj){
            for(var name in obj){
                x.setRequestHeader(name,obj[name]);
            }
        }
    }
};

var time = {
    toTime: function(tt) {
        var date = new Date();
        date.setTime(tt);
        var d = date.getFullYear() + "-" + time.numFormat(date.getMonth() + 1) + "-" + time.numFormat(date.getDate());
        var t = time.numFormat(date.getHours()) + ":" + time.numFormat(date.getMinutes());
        return ({ date: d, time: t, full: d + " " + t });
    },
    numFormat: function(num) {
        return (Math.abs(num) < 10) ? "0" + parseInt(num) : num;
    }
};

var king = {
    queryString: function(name) {
        var reg = new RegExp("(^|&)"+name+"=([^&]*(&|$))");
        var r = window.location.search.substr(1).match(reg);
        if(r!=null) {
            return decodeURI(r[2]);
        }
        return null;
    }
}
