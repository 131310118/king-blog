/**
 * Created by wangj on 2016/9/23.
 */

var querystring = require('querystring');
var url = require('url');
var ObjectID = require('mongodb').ObjectID;
var mongo = require('./mongo');
var md5 = require('./md5');
var fs = require('fs');
var formidable = require('formidable');
var jwt = require('jsonwebtoken');
/*var exec = require('child_process').exec;

function start(res){
    console.log('Request handler "start" was called.');
    exec('ls -lah', { timeout:1000, maxBuffer: 20000*1024 }, function(error, stdout, stderr){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write(stdout);
        res.end();
    })
}*/

function serverStaticFile(res, path, contentType, responseCode) {
    if(!responseCode) {
        responseCode = 200;
    }
    fs.readFile(__dirname + path, function(err, data) {
        if(err) {
            console.log(__dirname + path);
            res.writeHead(500, {"Content-Type": "text/plain"});
            res.write('500 - Interval Error');
            res.end();
        } else {
            console.log(__dirname + path);
            res.writeHead(responseCode, {"Content-Type": contentType});
            res.write(data);
            res.end();
        }
    })
}

function start(res, req, pathname) {
    console.log('Request handler "start" was called.');

    pathname = pathname == '/'?'/index.html':pathname;
    serverStaticFile(res, '/html' + pathname, 'text/html', 200);
}

function getIco(res, req, pathname) {
    console.log('Request handler "start" was called.');

    serverStaticFile(res, pathname, 'image/x-icon', 200);
}

function getPng(res, req, pathname, file) {
    console.log('Request handler "start" was called.');

    serverStaticFile(res, '/img' + pathname, 'image/' + file, 200);
}

/*function getGif(res, req, pathname, file) {
    console.log('Request handler "start" was called.');

    serverStaticFile(res, '/img' + pathname, 'image/' + file, 200);
}*/

function getCss(res, req, pathname) {
    serverStaticFile(res, '/css' + pathname, 'text/css', 200);
}

function getOtf(res, req, pathname) {
    serverStaticFile(res, '/fonts' + pathname, 'application/font-otf', 200);
}

function getEot(res, req, pathname) {
    serverStaticFile(res, '/fonts' + pathname, 'application/font-eot', 200);
}

function getSvg(res, req, pathname) {
    serverStaticFile(res, '/fonts' + pathname, 'application/font-svg', 200);
}

function getTtf(res, req, pathname) {
    serverStaticFile(res, '/fonts' + pathname, 'application/font-ttf', 200);
}

function getWoff(res, req, pathname) {
    serverStaticFile(res, '/fonts' + pathname, 'application/font-woff', 200);
}

function getWoff2(res, req, pathname) {
    serverStaticFile(res, '/fonts' + pathname, 'application/font-woff2', 200);
}

function getJs(res, req, pathname) {
    serverStaticFile(res, '/js' + pathname, 'text/javascript', 200);
}

function upload(res, req) {
    console.log('Request handler "upload" was called.');
    var form = new formidable.IncomingForm();
    form.uploadDir = '/root/myblog/img';
    form.keepExtensions = true;	 //保留后缀
    console.log('about to parse');
    form.parse(req, function(error, fields, files) {
        console.log('parsing done\n'+files.file.path);
        var name = files.file.path.match(/upload_(.*)/)[1];
        /*var extName = '';  //后缀名
        switch (files.file.type) {
            case 'image/pjpeg':
                extName = '.jpg';
                break;
            case 'image/jpeg':
                extName = '.jpg';
                break;
            case 'image/png':
                extName = '.png';
                break;
            case 'image/x-png':
                extName = '.png';
                break;
        }*/
        fs.renameSync(files.file.path, '/root/myblog/img/' + name/* + extName*/);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end('{"url": "' + name + '"}');
    })
}

function publish(res, req) {
    if(req.method.toLowerCase() === 'post') {
        var alldata = '';
        req.on('data', function(chunk) {
            alldata += chunk;
        });

        req.on('end', function() {
            check(req, {
                callback: function(user) {
                    console.log(alldata);
                    var dataString = alldata.toString();
                    var dataObj = querystring.parse(dataString);
                    if(dataObj.title
                        && dataObj.title.length
                        && dataObj.content
                        && dataObj.content.length
                        && (dataObj["imgs[]"].length
                        || (dataObj.summary && dataObj.summary.length))
                    ) {
                        var title = dataObj.title;
                        var content = dataObj.content;
                        var imgs = dataObj["imgs[]"];
                        var summary = dataObj.summary
                    } else {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end('{"status": 0, "log": "参数有误"}');
                        return;
                    }
                    mongo.publishBlog({
                        title: title,
                        content: content,
                        imgs: imgs,
                        summary: summary,
                        publish_time: new Date()*1,
                        author: user
                    }, user, res, function() {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end('{"status": 1, "log": "保存成功"}');
                    });
                },
                error: function() {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end('{"status": 0, "log": "没有权限"}');
                }
            });
        })
    }
}

function registed(res, req, pathname) {
    if(req.method.toLowerCase() === 'post') {
        var alldata = '';
        req.on('data', function(chunk) {
            alldata += chunk;
        });

        req.on('end', function() {
            console.log(alldata);
            var dataString = alldata.toString();
            var dataObj = querystring.parse(dataString);
            if(!(dataObj.username&&dataObj.password)){
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end('{"status": 0, "log": "参数有误"}');
                return;
            }
            var salt = {
                username: dataObj.username,
                salt: String(Math.random()).replace('.','')
            };
            var data = {
                username: dataObj.username,
                password: md5.md5(salt.salt+dataObj.password)
            };
           /* salt.salt = String(Math.random()).replace('.','');
            salt.username = data.username;*/
            //data.password = md5.md5(salt+data.password);
            console.log(data);
            console.log(salt);
            mongo.addUser(data, salt, res, function() {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end('{"status": 1, "log": "注册成功"}');
            });
        })
    }
}

function login(res, req) {
    if(req.method.toLowerCase() === 'post') {
        var alldata = '';
        req.on('data', function(chunk) {
            alldata += chunk;
        });

        req.on('end', function() {
            console.log(alldata);
            var dataString = alldata.toString();
            var dataObj = querystring.parse(dataString);
            if(!(dataObj.username&&dataObj.password)){
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end('{"status": 0, "log": "参数有误"}');
                return;
            }
            mongo.getSalt(dataObj.username, function(salt){
                mongo.getPassword(dataObj.username, function(password){
                    if(md5.md5(salt+dataObj.password)==password){
                        var token = jwt.sign({username: dataObj.username, iat: Math.floor(Date.now()/1000) + 30}, 'womenzuiqiang');
                        console.log(token);
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end('{"token": "' + token + '"}');
                    } else {
                        console.log(md5.md5(salt+dataObj.password)+':'+password);
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end('{"status": 0, "log": "登陆失败"}');
                    }
                })
            });
        })
    }
}

function checkLogin(res, req) {
    if(req.method.toLowerCase() === 'post') {
        var alldata = '';
        req.on('data', function(chunk) {
            alldata += chunk;
        });

        req.on('end', function() {
           /* console.log(alldata);
            var dataString = alldata.toString();
            var dataObj = querystring.parse(dataString);
            if(!(dataObj.username&&dataObj.password)){
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end('{"status": 0, "log": "参数有误"}');
                return;
            }*/
            check(req, {
                callback: function() {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end('{"status": 1, "log": "验证成功"}');
                },
                error: function() {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end('{"status": 0, "log": "验证失败"}');
                }
            });
            /*jwt.verify(req.headers.auth, 'womenzuiqiang', function(err, decode) {
                if(decode.username == '123') {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end('{"status": 1, "log": "验证成功"}');
                }
            })*/
        })
    }
}

function check(req, option) {
    jwt.verify(req.headers.auth, 'womenzuiqiang', function(err, decode) {
        if(decode.username && decode.username == '123') {
            option.callback(decode.username);
        } else {
            option.error();
        }
    })
}

function show(res) {
    console.log('Request handle "show" was called.');
    serverStaticFile(res, '/img/test.png', 'text/html', 200);
}

function getBlogsSummary(res, req) {
    var dataObj = querystring.parse(url.parse(req.url).query);
    if(dataObj && (dataObj.author == null || dataObj.page == null)) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end('{"status": 0, "log": "参数有误"}');
        return;
    }
    console.log(dataObj);
    var data = {
        author: dataObj.author,
        page: dataObj.page
    };
    mongo.getBlogsSummary(res, data, {
        success: function(data) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(data);
        },
        error: function() {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end('{"status": 0, "log": "稍后再试"}');
        }
    })
}

function getBlogDetail(res, req) {
    var dataObj = querystring.parse(url.parse(req.url).query);
    console.log('dataObj.pid: ' + dataObj.pid);
    var data = {
        '_id': ObjectID(dataObj.pid)
    };
    console.log('data: ' + data['_id']);
    mongo.getBlogDetail(res, data, {
        success: function(data) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(data);
        },
        error: function() {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end('{"status": 0, "log": "稍后再试"}');
        }
    })
}

exports.start = start;
exports.upload = upload;
exports.show = show;
exports.getIco = getIco;
exports.getPng = getPng;
/*exports.getGif = getGif;*/
exports.getCss = getCss;
exports.getOtf = getOtf;
exports.getEot = getEot;
exports.getSvg = getSvg;
exports.getTtf = getTtf;
exports.getWoff = getWoff;
exports.getWoff2 = getWoff2;
exports.registed = registed;
exports.login = login;
exports.getJs = getJs;
exports.checkLogin = checkLogin;
exports.publish = publish;
exports.getBlogsSummary = getBlogsSummary;
exports.getBlogDetail = getBlogDetail;