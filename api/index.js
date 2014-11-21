var db = require('./../data/db.js');
var fs = require('fs');
var gm = require('gm');
var nodemailer = require("nodemailer");
var async = require('async');
var request = require('request');
var mongoose = require('mongoose');



exports.setAvaToUser = function(req,res,next){
    var user = req.body.user;
    var file = req.files.file.path.split('/');
    file =  file.pop();

        if(req.files.file.type=='image/gif' || req.files.file.type=='image/jpeg' || req.files.file.type=='image/png'|| req.files.file.type=='image/bmp' && user){
            fs.createReadStream(req.files.file.path)
                .pipe(fs.createWriteStream('public/uploaded/'+file));
            res.send(200,file);
        }
}


exports.saveUserData = function(req,res,next){
    var dateIncome = req.body.dateOfBirth;
    dateIncome = dateIncome.split('/');
    var day = dateIncome[0];
    var month = dateIncome[1]-1;
    var year = dateIncome[2];
    var dateOfBirdth = new Date(year, month, day);
    db.userDBModel.create({
        name:req.body.name,
        password:req.body.passwordR,
        gender:req.body.gender,
        facebookId:req.body.facebookId,
        vkId: req.body.vkId,
        twitterId: req.body.twitterId,
        second_name: req.body.secondName,
        date_ofBirth: dateOfBirdth,
        place_ofBirth: req.body.placeOfBirth,
        languages_able: req.body.selectedLanguages,
        date_ofRegister: new Date(),
        email: req.body.email,
        about: req.body.about,
        skype:req.body.skype,
        phone: req.body.phone,
        ava: req.body.ava,
        facebook: req.body.facebookLink,
        vk: req.body.vkLink,
        twitter:req.body.twitterLink
    },function(err,info){
        if(err) return next(err);
        fs.mkdir('public/uploaded/'+info._id, function(){
            fs.createReadStream('public/uploaded/'+req.body.ava)
                .pipe(fs.createWriteStream('public/uploaded/'+info._id+'/'+req.body.ava));
            gm('public/uploaded/'+info._id+'/'+req.body.ava)
                .resize(300)
                .write('public/uploaded/'+info._id+'/mini_'+req.body.ava, function (err) {
                    fs.unlink('public/uploaded/'+req.body.ava,function(err){
                        if(err) return next(err);
                        res.send(200,info);
                    })
                });
        });
    })
}


exports.getUserInfo = function(req,res,next){
    db.userDBModel.find({_id:req.body.userId},function(err,data){
        if(err) return next(err);
        res.send(200,data[0]);
    });
}

exports.deleteAvaFromUser = function(req,res,next){
    var file = req.params.file;
    fs.unlink(__dirname+'/../public/uploaded/'+file,function(err){
        if(err) return next(err);
        res.send(200);
    })
}

exports.changeAvaUser = function(req,res,next){
    var file = req.files.file.path.split('/');
    file =  file.pop();
    var userId = req.body.userId;
    var oldAva = req.body.oldAva;
    fs.exists(__dirname+'/../public/uploaded/'+userId+'/'+oldAva, function (exists) {
        if(exists){
            db.userDBModel.update({_id:userId},{ava:file},{upsert:true},function(err){
                if(err) return next(err);
                fs.unlink(__dirname+'/../public/uploaded/'+userId+'/'+oldAva,function(err){
                    if(err) return next(err);
                    fs.unlink(__dirname+'/../public/uploaded/'+userId+'/mini_'+oldAva,function(err){
                        if(err) return next(err);
                        fs.createReadStream(req.files.file.path)
                            .pipe(fs.createWriteStream('public/uploaded/'+userId+'/'+file));
                        gm('public/uploaded/'+userId+'/'+file)
                            .resize(300)
                            .write('public/uploaded/'+userId+'/mini_'+file, function (err) {
                                res.send(200,file);
                            });
                    });
                });
            });
        }else{
            db.userDBModel.update({_id:userId},{ava:file},{upsert:true},function(err){
                if(err) return next(err);
                        fs.createReadStream(req.files.file.path)
                            .pipe(fs.createWriteStream('public/uploaded/'+userId+'/'+file));
                        gm('public/uploaded/'+userId+'/'+file)
                            .resize(300)
                            .write('public/uploaded/'+userId+'/mini_'+file, function (err) {
                                res.send(200,file);
                            });
            });
        }
    });
}

exports.deleteAva = function(req,res,next){
    var userId = req.body.userId;
    var ava = req.body.ava;
    fs.exists(__dirname+'/../public/uploaded/'+userId+'/'+ava, function (exists) {
        if(exists){
            db.userDBModel.update({_id:userId},{$unset:{ava:''}},function(err){
                if(err) return next(err);
                fs.unlink(__dirname+'/../public/uploaded/'+userId+'/'+ava,function(err){
                    if(err) return next(err);
                    fs.unlink(__dirname+'/../public/uploaded/'+userId+'/mini_'+ava,function(err){
                        if(err) return next(err);
                        res.send(200)
                    });
                });
            });
        }else{
            db.userDBModel.update({_id:userId},{$unset:{ava:''}},function(err){
                if(err) return next(err);
                res.send(200);
            });
        }
    });
}

exports.insertAvaUser = function(req,res,next){
    var file = req.files.file.path.split('/');
    file =  file.pop();
    var userId = req.body.userId;
    db.userDBModel.update({_id:userId},{ava:file},{upsert:true},function(err){
        if(err) return next(err);
        fs.createReadStream(req.files.file.path)
            .pipe(fs.createWriteStream('public/uploaded/'+userId+'/'+file));
        gm('public/uploaded/'+userId+'/'+file)
            .resize(300)
            .write('public/uploaded/'+userId+'/mini_'+file, function (err) {
                //console.log(file);
                res.send(200,file);
            });
    });
}

exports.loginUser = function(req,res,next){
    var email = req.body.email;
    var pwd = req.body.pwd;
    db.userDBModel.find({email:email,password:pwd},function(err,data){
        if(err) return next(err);
        //console.log(data);
        res.send(200,data[0]);
    });
}

exports.checkEmailExist = function(req,res,next){
    var email = req.params.email;
    db.userDBModel.find({email:email},function(err,data){
        if(err) return next(err);
        res.send(200,data);
    });
}

exports.insertPicturesUser = function(req,res,next){
    var folder = req.body.folder;
    var userId = req.body.userId;
    var file = req.files.file.path.split('/');
    file =  file.pop();
    var date = new Date();
    var obj = {};
    obj.title = file;
    obj.folder = folder;
    obj.date = date;

    db.userDBModel.update({_id:userId},{$push:{photos:obj}},{upsert:true},function(err,data){
        if(err) return next(err);
        fs.mkdir(__dirname+'/../public/uploaded/'+userId+'/'+folder,function(){
            fs.createReadStream(req.files.file.path)
                .pipe(fs.createWriteStream('public/uploaded/'+userId+'/'+folder+'/'+file));
            gm('public/uploaded/'+userId+'/'+folder+'/'+file)
                .resize(300)
                .write('public/uploaded/'+userId+'/'+folder+'/mini_'+file, function (err) {
                    fs.exists('public/uploaded/'+userId+'/'+folder+'/mini_'+file, function (exists) {
                        if(exists){
                            console.log('mini created');
                            res.send(200,file);
                        }else{
                            gm('public/uploaded/'+userId+'/'+folder+'/'+file)
                                .resize(300)
                                .write('public/uploaded/'+userId+'/'+folder+'/mini_'+file, function (err) {
                                    fs.exists('public/uploaded/'+userId+'/'+folder+'/mini_'+file, function (exists) {
                                        if(exists){
                                            console.log('mini created');
                                            res.send(200,file);
                                        }
                                    });
                                });
                        }
                    });
                });
        });
    });

    /*db.userDBModel.aggregate({$match:{'photos.folder':folder}},function(err,data){
        if(err) return next(err);
        if(data.length!=0){

        }else{
            db.userDBModel.update({_id:userId},{$push:{photos:{'folder':folder,'title':file,'date':date}}},function(err){
                if(err) return next(err);
                fs.mkdir(__dirname+'/../public/uploaded/'+userId+'/'+folder,function(){
                    fs.createReadStream(req.files.file.path)
                    .pipe(fs.createWriteStream('public/uploaded/'+userId+'/'+folder+'/'+file));
                    gm('public/uploaded/'+userId+'/'+folder+'/'+file)
                    .resize(170, 140)
                    .write('public/uploaded/'+userId+'/'+folder+'/mini_'+file, function (err) {
                    res.send(200,file);
                    });
                });
            });
        }
    });*/

//    db.userDBModel.update({_id:userId},{$push:{photos:{'folder':folder,'title':file,'date':date}}},function(err){
//        if(err) return next(err);
       /* fs.mkdir(__dirname+'/../public/uploaded/'+userId+'/'+folder,function(){
            fs.createReadStream(req.files.file.path)
                .pipe(fs.createWriteStream('public/uploaded/'+userId+'/'+folder+'/'+file));
            gm('public/uploaded/'+userId+'/'+folder+'/'+file)
                .resize(170, 140)
                .write('public/uploaded/'+userId+'/'+folder+'/mini_'+file, function (err) {
                    res.send(200,file);
                });
        });*/
//    });
}

exports.foldersList = function(req,res,next){
    var userId = req.params.userId;
    db.userDBModel.aggregate(
        {$match: {'_id': mongoose.Types.ObjectId(userId)} },
        {$unwind:'$photos'},
        {$group:{_id:'$photos.folder',count: { $sum: 1 }}},
        function(err,data){
            if(err) return next(err);
            var exArr = [];
            for(var i=0; i<data.length; i++){
                    var exObj = {};
                    exObj.folder = data[i]._id;
                    exObj.summ = data[i].count;
                    exArr.push(exObj);
            }
            res.send(200,exArr);
        });
}

exports.foldersVideo = function(req,res,next){
    var userId = req.params.userId;
    db.userDBModel.aggregate(
        {$match: {'_id': mongoose.Types.ObjectId(userId)} },
        {$unwind:'$videos'},
        {$group:{_id:'$videos.folder',count: { $sum: 1 }}},
        function(err,data){
            if(err) return next(err);
            var exArr = [];
            for(var i=0; i<data.length; i++){
                var exObj = {};
                exObj.folder = data[i]._id;
                exObj.summ = data[i].count;
                exArr.push(exObj);
            }
            res.send(200,exArr);
        });
}

exports.picsInFolder = function(req,res,next){
    var folder = req.params.folder;
    var userId = req.params.userId;
    db.userDBModel.aggregate({$unwind:'$photos'},
        {
            $match: {
                $and: [
                    {'_id': mongoose.Types.ObjectId(userId)},
                    {'photos.folder':folder}
                ]
            }
        },
        { $group : { _id : "$photos.folder", photos: { $push: "$photos.title" } } },
        function(err,data){
            if(err) return next(err);
            res.send(200,data);
        }
    );
   /* console.log(folder);
    db.userDBModel.find({'photos.folder':folder}
        ,{'photos':1},function(err,data){
        if(err) return next(err);
        console.log(data);
        res.send(200,data);
    });*/
}

exports.deletePic = function(req,res,next){
    var userId = req.params.userId;
    var pic = req.params.picture;
    var folder = req.params.folder;
    db.userDBModel.update({_id:userId},
        { $pull: { 'photos': {'title': pic} } },
        { multi: true },
        function(err,data){
            if(err) return next(err);
            fs.unlink(__dirname+'/../public/uploaded/'+userId+'/'+folder+'/'+pic,function(err){
                if(err) return next(err);
                fs.unlink(__dirname+'/../public/uploaded/'+userId+'/'+folder+'/mini_'+pic,function(err){
                    if(err) return next(err);
                    res.send(200);
                });
            });
        }
    );
}


exports.insertVideosUser = function(req,res,next){
    var folder = req.body.folder;
    var userId = req.body.userId;
    var file = req.files.file.path.split('/');
    file =  file.pop();
    var date = new Date();
    var obj = {};
    obj.title = file;
    obj.folder = folder;
    obj.date = date;

    db.userDBModel.update({_id:userId},{$push:{videos:obj}},{upsert:true},function(err,data){
        if(err) return next(err);
        fs.mkdir(__dirname+'/../public/uploaded/'+userId+'/'+folder,function(){
            fs.createReadStream(req.files.file.path)
                .pipe(fs.createWriteStream('public/uploaded/'+userId+'/'+folder+'/'+file));
                res.send(200,file);
        });
    });
}

exports.videosInFolder = function(req,res,next){
    var folder = req.params.folder;
    var userId = req.params.userId;
    db.userDBModel.aggregate({$unwind:'$videos'},
        {
            $match: {
                $and: [
                    {'_id': mongoose.Types.ObjectId(userId)},
                    {'videos.folder':folder}
                ]
            }
        },
        { $group : { _id : "$videos.folder", videos: { $push: "$videos.title" } } },
        function(err,data){
            if(err) return next(err);
            res.send(200,data);
        }
    );
}

exports.deleteVideo = function(req,res,next){
    var userId = req.params.userId;
    var video = req.params.video;
    var folder = req.params.folder;
    db.userDBModel.update({_id:userId},
        { $pull: { 'videos': {'title': video} } },
        { multi: true },
        function(err,data){
            if(err) return next(err);
            fs.unlink(__dirname+'/../public/uploaded/'+userId+'/'+folder+'/'+video,function(err){
                if(err) return next(err);
                res.send(200)
            });
        }
    );
}

exports.searchPerson = function(req,res,next){
    var name = req.body.name;
    var secondName = req.body.secondName;
    var place = req.body.place;
    var dateIncome = req.body.date;
    var ageFrom = req.body.ageFrom;
    var ageTill = req.body.ageTill;
    var destination = req.body.destination;
    var gender = req.body.gender;
    var languages = req.body.languages;


    var curs;
    curs = db.userDBModel.find({},function(err){
        async.series([
            function(callback){
                // do some stuff ...
                if(name){
                    curs = curs.find({name:name},function(err,data){
                        if(err) return next(err);
                        if(data.length==0){
                            callback(null,'empty');
                        }else{
                            callback(null,data);
                        }
                    });
                }else{
                    callback(null);
                }

            },
            function(callback){
                // do some stuff ...
                if(secondName){
                    curs = curs.find({second_name:secondName},function(err,data){
                        if(err) return next(err);
                        if(data.length==0){
                            callback(null,'empty');
                        }else{
                            callback(null,data);
                        }
                    });
                }else{
                    callback(null);
                }
            },
            function(callback){
                // do some stuff ...
                if(place){
                    curs = curs.find({place_ofBirth:place},function(err,data){
                        if(err) return next(err);
                        if(data.length==0){
                            callback(null,'empty');
                        }else{
                            callback(null,data);
                        }
                    });
                }else{
                    callback(null);
                }
            },
            function(callback){
                // do some stuff ...
                if(dateIncome){
                    dateIncome = dateIncome.split('/');
                    var day = dateIncome[0];
                    var month = dateIncome[1]-1;
                    var year = dateIncome[2];
                    var dateOfBirthFrom = new Date(year,month,day,0,0,0,0);
                    var dateOfBirthTill = new Date(year,month,day,23,59,59,0);
                    db.userDBModel.find({date_ofBirth:{$gte:dateOfBirthFrom,$lt:dateOfBirthTill}},function(err,data){
                        if(err) return next(err);
                        if(data.length==0){
                            callback(null,'empty');
                        }else{
                            callback(null,data);
                        }
                    })
                }else{
                    callback(null);
                }
            },
            function(callback){
                // do some stuff ...
                if(ageFrom){
                    ageFrom = Number(ageFrom);
                    if(ageFrom == 'NaN'){
                        callback(null);
                    }else{
                        var today = new Date();
                        var year = today.getFullYear();
                        var past = year - ageFrom;
                        var pastFull = new Date(past,0,1,0,0,0,0);
                        db.userDBModel.find({date_ofBirth:{$lt:pastFull}},function(err,data){
                            if(err) return next(err);
                            if(data.length==0){
                                callback(null,'empty');
                            }else{
                                callback(null,data);
                            }
                        })
                    }
                }else{
                    callback(null);
                }
            },
            function(callback){
                // do some stuff ...
                if(ageTill){
                    ageTill = Number(ageTill);
                    if(ageTill == 'NaN'){
                        callback(null);
                    }else{
                        var today = new Date();
                        var year = today.getFullYear();
                        var future = year - ageTill;
                        var futureFull = new Date(future,0,1,0,0,0,0);
                        db.userDBModel.find({date_ofBirth:{$gte:futureFull}},function(err,data){
                            if(err) return next(err);
                            if(data.length==0){
                                callback(null,'empty');
                            }else{
                                callback(null,data);
                            }
                        })
                    }
                }else{
                    callback(null);
                }
            },
            function(callback){
                if(destination){
                    curs = curs.find({destination:destination},function(err,data){
                        if(err) return next(err);
                        if(data.length==0){
                            callback(null,'empty');
                        }else{
                            callback(null,data);
                        }
                    });
                }else{
                    callback(null);
                }
            },
            function(callback){
                if(gender){
                    curs = curs.find({gender:gender},function(err,data){
                        if(err) return next(err);
                        if(data.length==0){
                            callback(null,'empty');
                        }else{
                            callback(null,data);
                        }
                    });
                }else{
                    callback(null);
                }
            },
            function(callback){
                if(languages.length!=0){
                    curs = curs.find({languages_able:{$in:languages}},function(err,data){
                        if(err) return next(err);
                        if(data.length==0){
                            callback(null,'empty');
                        }else{
                            callback(null,data);
                        }
                    });
                }else{
                    callback(null);
                }
            }
        ],


// optional callback
            function(err, results){
                var exArr = [];
                for(var i=results.length; i>=0; --i){
                    if(results[i]){
                        exArr.push(results[i]);
                    }
                }
                var obj = {};
                obj.result = exArr[0];
                res.send(200,obj);
            });
    })
}

exports.addToFriends = function(req,res,next){
    var friendsId = req.body.id;
    var myId = req.body.myId;
    db.userDBModel.update({_id:myId},{$addToSet:{friends:friendsId}},function(err,data){
        if(err) return next(err);
        res.send(200);
    });
}

exports.deleteFromFriends = function(req,res,next){
    var friendsId = req.body.id;
    var myId = req.body.myId;
    db.userDBModel.update({_id:myId},{$pull:{friends:friendsId}},function(err,data){
        if(err) return next(err);
        res.send(200);
    });
}

exports.makeChangesUser = function(req,res,next){
    var id = req.body.id;
    var email = req.body.email;
    var skype = req.body.skype;
    var phone = req.body.phone;
    var languages = req.body.languages;
    var about = req.body.about;
    var destination = req.body.destination;
    var gender = req.body.gender;

    async.series([
        function(callback){
            if(email){
                db.userDBModel.update({_id:id},{
                    email:email
                },function(err){
                    if(err) return next(err);
                    callback(null, 'email');
                });
            }else{
                callback(null, 'email');
            }
        },
        function(callback){
            if(skype){
                db.userDBModel.update({_id:id},{
                    skype:skype
                },function(err){
                    if(err) return next(err);
                    callback(null, 'skype');
                });
            }else{
                callback(null, 'skype');
            }
        },
        function(callback){
            if(phone){
                db.userDBModel.update({_id:id},{
                    phone:phone
                },function(err){
                    if(err) return next(err);
                    callback(null, 'phone');
                });
            }else{
                callback(null, 'phone');
            }
        },
        function(callback){
            if(languages){
                db.userDBModel.update({_id:id},{
                    languages_able:languages
                },function(err){
                    if(err) return next(err);
                    callback(null, 'languages');
                });
            }else{
                callback(null, 'languages');
            }
        },
        function(callback){
            if(about){
                db.userDBModel.update({_id:id},{
                    about:about
                },function(err){
                    if(err) return next(err);
                    callback(null, 'about');
                });
            }else{
                callback(null, 'about');
            }
        },
        function(callback){
            if(destination){
                db.userDBModel.update({_id:id},{
                    destination:destination
                },function(err){
                    if(err) return next(err);
                    callback(null, 'destination');
                });
            }else{
                callback(null, 'destination');
            }
        },
        function(callback){
            if(gender){
                db.userDBModel.update({_id:id},{
                    gender:gender
                },function(err){
                    if(err) return next(err);
                    callback(null, 'gender');
                });
            }else{
                callback(null, 'gender');
            }
        }
    ],
        function(err, results){
            res.send(200);
        });
}

exports.auth = function(req,res,next){
    if (!req.isAuthenticated()){
        res.send(401)
    }else{
        next()
    }
}

function insertPicEvent(req,res){
    var format = req.files.file.type;
    var patt = /image/i;
    var formatCheck = patt.test(format);
    if(formatCheck){
        var filename = req.files.file.path;
        filename = filename.split('/');
        filename = filename.pop();
        fs.createReadStream(req.files.file.path)
            .pipe(fs.createWriteStream('public/uploaded/'+req.body.userId+'/'+filename));
        gm('public/uploaded/'+req.body.userId+'/'+filename)
            .resize(300)
            .write('public/uploaded/'+req.body.userId+'/mini'+filename, function (err) {
                fs.exists('public/uploaded/'+req.body.userId+'/mini'+filename, function (exists) {
                    if(exists){
                        db.eventsDBModel.update({posted_by:req.body.userId,title:req.body.eventTitle},{$push:{photos:filename}},{upsert:true},function(err){
                            if(err) return next(err);
                            res.send(200,filename);
                        });
                    }else{
                        insertPicEvent(req,res)
                    }
                });
            });
    }else{
        res.send(200,'wrong format');
    }
}
function insertVidsEvent(req,res){
    var format = req.files.file.type;
    var patt = /video/i;
    var formatCheck = patt.test(format);
    if(formatCheck){
        var filename = req.files.file.path;
        filename = filename.split('/');
        filename = filename.pop();
        fs.createReadStream(req.files.file.path)
            .pipe(fs.createWriteStream('public/uploaded/'+req.body.userId+'/'+filename));
        fs.exists('public/uploaded/'+req.body.userId+'/'+filename, function (exists) {
            if(exists){
                db.eventsDBModel.update({posted_by:req.body.userId,title:req.body.eventTitle},{$push:{videos:filename}},{upsert:true},function(err){
                    if(err) return next(err);
                    res.send(200,filename);
                });
            }else{
                insertPicEvent(req,res)
            }
        });
    }else{
        res.send(200,'wrong format');
    }
}
exports.insertPicturesEvent = function(req,res,next){
    insertPicEvent(req,res);
}
exports.insertVideosEvent = function(req,res,next){
    insertVidsEvent(req,res);
}
exports.deletePicEvent = function(req,res,next){
    var userId = req.body.userId;
    var pic = req.body.picture;
    var title = req.body.title;
    db.eventsDBModel.update({posted_by:userId,title:title},{$pull:{photos:{$regex:pic,$options:'i'}}},function(err){
        if(err) return next(err);
        fs.unlink('public/uploaded/'+userId+'/mini'+pic,function(err){
            if(err) return next(err);
            fs.unlink('public/uploaded/'+userId+'/'+pic,function(err){
                if(err) return next(err);
                res.send(200);
            })
        })
    });
}
exports.pasteUserFace = function(profile){
    db.userDBModel.update({name:profile.name.givenName},{facebook:profile.id},{upsert:true},function(err){
        //if(err) return next(err);
        //res.send(200);
    })
}

exports.pasteUserVkontakte = function(profile){
    console.log(profile);
    /*db.userDBModel.update({name:profile.name.givenName},{vk:profile.id},{upsert:true},function(err){
        if(err) console.log(err);
    })*/
}

exports.getUserWithFacebook = function(req,res,next){
    var facebookId = req.body.id;
    db.userDBModel.find({facebook:facebookId},function(err,data){
        if(err) return next(err);
        var obj = {};
        obj.res = data;
        res.send(200,obj);
    });
}
