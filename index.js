/**
 * Created by wangj on 2016/9/23.
 */

var server = require('./server');
var route = require('./route');

server.start(route.route);
