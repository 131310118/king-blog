/**
 * Created by wangj on 2016/9/27.
 */

var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;
var mongo = new MongoClient();
var myDB = null;

function connectDB() {
    mongo.connect('mongodb://localhost/', function(err, db) {
        myDB = db.db('myblog');
    });
}
function addUser(data,salt,res,callback) {
    myDB.collection('users', function(err, collection) {
        collection.findOne({'username': data.username}, function(err, item) {
            if(item) {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end('{"status": 0, "log": "用户名已存在"}');
                return;
            }
            var options = {
                w: 1,
                timeout: 5000,
                journal: true,
                fsync: false
            };   
            collection.insert(data, options, function(err, results) {
                myDB.collection('salts', function(err, collection) {
                    collection.insert(salt, options, function(err, results) {
                        callback();
                        console.log(results);
                    })
                });
                console.log(results);
            })
        });
    });
}
function getSalt(username, callback) {
    myDB.collection('salts', function(err, collection) {
        collection.findOne({'username': username}, function(err, item) {
            console.log(item);
            callback(item.salt);
        })
    })
}
function getPassword(username, callback) {
    myDB.collection('users', function(err, collection) {
        collection.findOne({'username': username}, function(err, item) {
            callback(item.password);
        })
    })
}
function publishBlog(data, user, res, callback) {
    var options = {
        w: 1,
        timeout: 5000,
        journal: true,
        fsync: false
    };
    myDB.collection('blogs', function(err, collection) {
        collection.insert(data, options, function(err, results) {
            callback();
            console.log(results);
        })
    });
}
function getBlogDetail(res, data, callback) {
    myDB.collection('blogs', function(err, collection) {
        collection.findOne(data, function(err, item) {
            console.log('blogdetail: ' + item);
            var jsonArray = {
                '_id': item['_id'],
                'author': item.author,
                'publish_time': item['publish_time'],
                'content': item.content,
                'title': item.title
            };
            callback.success(JSON.stringify(jsonArray));
        })
    });
}
function getBlogsSummary(res, data, callback) {
    var totalPage = 0;
    var limit = 10;
    myDB.collection('blogs', function(err, collection) {
        collection.count({}, function(err, count) {
            totalPage = Math.floor(count / limit);
            if(count % limit != 0) {
                totalPage++;
            }
            var currentPage = data.page > totalPage?totalPage:data.page;
            console.log('totalPage: ' + totalPage + '\nlimit: ' + limit + '\ncurrentPage: ' + currentPage + '\nskip: ' + Math.floor(currentPage - 1) * limit);
            collection.find({}, {"title": 1, "summary": 1, "imgs": 1, "publish_time": 1, "author": 1})
                .limit(limit)
                .skip(Math.floor(currentPage - 1) * limit)
                .toArray(function(err, results) {
                    console.log('result: ' + results);
                    var jsonArray = {
                        totalPage: totalPage,
                        limit: limit,
                        data: results
                    };
                    callback.success(JSON.stringify(jsonArray));
                });
        });
    })
}
function createClassify(res, data, callback) {
    myDB.collection('users', function(err, collection) {
        collection.updateOne({username:data.username}, {$addToSet:{tags:data.tagName}}, {upsert:true}, function(err, r) {
            console.log('tags ' + r);
            if(err) {
                callback.error();
                return;
            }
            if(r.result.n == 1) {
                callback.success();
            } else {
                callback.error()
            }
        })
    })
}
function getClassify(res, data, callback) {
    myDB.collection('users', function(err, collection) {
        collection.findOne({username: data.username}, {fields: {tags: 1, _id: 0}}, function(err, r) {
            if(!r.tags) {
                callback.success(JSON.stringify({tags: []}));
                return;
            }
            /*console.log(!r);
            for(var key in r) {
                console.log('r.' + key + ': ' + r[key]);
            }*/
            console.log('findTags ' + r.tags);
            if(err) {
                callback.error();
                return;
            }
            var arrTags = r.tags.toString().split(',');
            callback.success(JSON.stringify({tags: arrTags}));
            /*if(r.result.ok == 1) {
                callback.success(r);
            } else {
                callback.error()
            }*/
        })
    })
}
function closeDB(collection) {
    myDB.close();
}

exports.connectDB = connectDB;
exports.addUser = addUser;
exports.publishBlog = publishBlog;
exports.getSalt = getSalt;
exports.getPassword = getPassword;
exports.getBlogsSummary = getBlogsSummary;
exports.getBlogDetail = getBlogDetail;
exports.createClassify = createClassify;
exports.getClassify = getClassify;
