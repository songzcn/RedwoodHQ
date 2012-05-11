exports.usersPut = function(req, res){
    var app =  require('../common');
    var db = app.getDB();
    var data = req.body;
    data._id = db.bson_serializer.ObjectID(data._id);
    data.password = require('crypto').createHmac('md5',"redwood").update(data.password).digest('hex');
    UpdateUsers(app.getDB(),data,function(err){
        res.contentType('json');
        res.json({
            success: !err,
            users: req.body
        });
    });
    var Tags = require('./userTags');
    Tags.CleanUpUserTags();
};

exports.usersGet = function(req, res){
    var app =  require('../common');
    GetUsers(app.getDB(),{},function(data){
        res.contentType('json');
        res.json({
            success: true,
            users: data
        });
    });
};

exports.usersDelete = function(req, res){
    var app =  require('../common');
    //DeleteUsers(app.getDB(),{_id: req.params.id},function(err){
    var db = app.getDB();
    var id = db.bson_serializer.ObjectID(req.params.id);
    if (db.username == "admin") return;
    DeleteUsers(app.getDB(),{_id: id},function(err){
        res.contentType('json');
        res.json({
            success: !err,
            users: []
        });
    });
    var Tags = require('./userTags');
    Tags.CleanUpUserTags();
};

exports.usersPost = function(req, res){
    var app =  require('../common');
    var data = req.body;
    delete data._id;
    CreateUsers(app.getDB(),data,function(returnData){
        res.contentType('json');
        res.json({
            success: true,
            users: returnData
        });
    });
};

function CreateUsers(db,data,callback){
    db.collection('users', function(err, collection) {
        data._id = db.bson_serializer.ObjectID(data._id);
        collection.insert(data, {safe:true},function(err,returnData){
            callback(returnData);
        });
    });
}

function UpdateUsers(db,data,callback){
    db.collection('users', function(err, collection) {

        //collection.update({_id:data._id},data,{safe:true},function(err){
        collection.save(data,{safe:true},function(err){
            if (err) console.warn(err.message);
            else callback(err);
        });
    });

}

function DeleteUsers(db,data,callback){
    db.collection('users', function(err, collection) {
        collection.remove(data,{safe:true},function(err) {
            callback(err);
        });
    });

}

function GetUsers(db,query,callback){
    var users = [];

    db.collection('users', function(err, collection) {
        collection.find(query, {}, function(err, cursor) {
            cursor.each(function(err, user) {
                if(user == null) {
                    callback(users);
                }
                users.push(user);
            });
        })
    })
}