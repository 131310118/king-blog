/**
 * Created by wangj on 2016/9/23.
 */

var querystring = require('querystring');
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

function getPng(res, req, pathname) {
    console.log('Request handler "start" was called.');

    serverStaticFile(res, '/img' + pathname, 'image/png', 200);
}

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
    serverStaticFile(res, pathname, 'text/javascript', 200);
}

function upload(res, req) {
    console.log('Request handler "upload" was called.');

    var form = new formidable.IncomingForm();
    console.log('about to parse');
    form.parse(req, function(error, fields, files) {
        console.log('parsing done');
        fs.renameSync(files.upload.path, '/root/img/test.png');
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('received image:<br/>');
        res.write('<img src="/show"/>');
        res.end();
    })
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
            console.log(alldata);
            var dataString = alldata.toString();
            var dataObj = querystring.parse(dataString);
            if(!(dataObj.username&&dataObj.password)){
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end('{"status": 0, "log": "参数有误"}');
                return;
            }
            jwt.verify(req.headers.auth, 'womenzuiqiang', function(err, decode) {
                if(decode.username == '123') {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end('{"status": 1, "log": "验证成功"}');
                }
            })
        })
    }
}

function show(res) {
    console.log('Request handle "show" was called.');
    serverStaticFile(res, '/img/test.png', 'text/html', 200);
}

exports.start = start;
exports.upload = upload;
exports.show = show;
exports.getIco = getIco;
exports.getPng = getPng;
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