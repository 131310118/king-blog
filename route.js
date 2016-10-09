/**
 * Created by wangj on 2016/9/23.
 */

var requestHandlers = require('./requestHandlers');
var handle = {};
handle['js'] = requestHandlers.getJs;
handle['css'] = requestHandlers.getCss;
handle['html'] = requestHandlers.start;
handle['png'] = requestHandlers.getPng;
handle['jpg'] = requestHandlers.start;
handle['gif'] = requestHandlers.getPng;
handle['ico'] = requestHandlers.getIco;
handle['otf'] = requestHandlers.getOtf;
handle['eot'] = requestHandlers.getEot;
handle['svg'] = requestHandlers.getSvg;
handle['ttf'] = requestHandlers.getTtf;
handle['woff'] = requestHandlers.getWoff;
handle['woff2'] = requestHandlers.getWoff2;
handle['/'] = requestHandlers.start;
handle['/registed'] = requestHandlers.registed;
handle['/login'] = requestHandlers.login;
handle['/index'] = requestHandlers.start;
handle['/upload'] = requestHandlers.upload;
handle['/show'] = requestHandlers.show;
handle['/checkLogin'] = requestHandlers.checkLogin;

function route(pathname, res, req){
    console.log('About to route a request for ' + pathname);
    var roat = pathname.match(/\.(\w+)$/);
    if(roat) {
        var file = pathname.match(/\.(\w+)$/)[1]||pathname;
    } else {
        file = pathname;
    }
    //var file = pathname.match(/\.(\w+)$/)[1]||pathname;
    if(file instanceof Array){
        file = file[0];
    }
    console.log(file);
    if(typeof handle[file] === 'function'){
        handle[file](res, req, pathname, file);
    }else{
        console.log('No request handler found for ' + pathname);
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.write('404 Not found');
        res.end();
    }
}

exports.route = route;
