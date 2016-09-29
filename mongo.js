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
function closeDB(collection) {
    myDB.close();
}

exports.connectDB = connectDB;
exports.addUser = addUser;
exports.getSalt = getSalt;
exports.getPassword = getPassword;
