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
        reg=new RegExp("(^| )"+key+"=([^;]*)(;|$)");
        return document.cookie.match(reg)[2];
    },
    removeCookie: function(key) {
        cookie.setCookie(key,cookie.getCookie(),-1);
    }
};

var xhr = {
    formatParam: function (data){
        var arr = [];
        for(var name in data){
            arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
        }
        return arr.join('&');
    },
    ajax: function(option) {
        var x = new XMLHttpRequest();
        if(option.type.toLowerCase() == 'get') {
            if(option.data) {
                x.open('get', option.url + '?' + xhr.formatParam(option.data), true);
            } else {
                x.open('get', option.url, true);
            }
        } else if(option.type.toLowerCase() == 'post') {
            x.open('post', option.url, true);
            xhr.setHeader(x, {"Content-Type": "application/x-www-form-urlencoded"});
            xhr.setHeader(x, option.header);
            x.send(xhr.formatParam(option.data));
            x.onreadystatechange = function () {
                if(x.readyState == 4) {
                    if(x.status == 200) {
                        var res;
                        if(option.dataType && option.dataType.toLowerCase() == 'json') {
                            res = JSON.parse(x.response);
                        }
                        option.success && option.success(x.response);
                    } else {
                        option.error && option.error(x);
                    }
                    option.complete && option.complete(x)
                }
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
