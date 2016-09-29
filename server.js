/**
 * Created by wangj on 2016/9/23.
 */

var http = require('http');
var url = require('url');
var mongo = require('./mongo');

function start(route) {
    function onRequest(req, res){
        //var postData = '';
        var pathname = url.parse(req.url).pathname;
        console.log('Request for ' + pathname + ' received.');

       /* req.setEncoding('utf8');

        req.addListener('data', function(postDataChunk) {
            postData += postDataChunk;
            console.log('Received POST data chunk "' + postDataChunk + '".');
        });

        req.addListener('end', function() {
            route(handle, pathname, res, postData);
        });*/

        route(pathname, res, req);
    }

    mongo.connectDB();
    http.createServer(onRequest).listen(3000);
    console.log('Server has started.');
}

exports.start = start;
