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
    myDB.collection(user + 'Blog', function(err, collection) {
        collection.insert(data, options, function(err, results) {
            callback();
            console.log(results);
        })
    });
}
function getBlogs(res, data, callback) {
    myDB.collection(data.author + 'Blog', function(err, collection) {
        collection.find().exec(function(err, items) {
            var limit = 10;
            var currentPage = data.page;
            if(err) {
                callback.error();
            } else {
                var totalPage = Math.floor(items.length / limit);
                if(items.length % limit != 0) {
                    totalPage++;
                }
                if(data.page > totalPage) {
                    currentPage = totalPage;
                }
                var query = collection.find();
                query.skip((currentPage - 1) * limit);
                query.limit(limit);
                query.exec(function(err, result) {
                    var jsonArray = {
                        totalCount: items.length,
                        limit: limit,
                        data: result
                    };
                    callback.succes(jsonArray);
                })
            }
        })
    })
}
function closeDB(collection) {
    myDB.close();
}

exports.connectDB = connectDB;
exports.addUser = addUser;
exports.getSalt = getSalt;
exports.getPassword = getPassword;
exports.publishBlog = publishBlog;
exports.getBlogs = getBlogs;
