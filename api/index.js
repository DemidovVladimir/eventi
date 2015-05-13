var db = require('./../data/db.js');
var fs = require('fs');
var gm = require('gm');
var nodemailer = require("nodemailer");
var async = require('async');
var request = require('request');
var mongoose = require('mongoose');
//var mongoose = require('mongoose');
var ffmpeg = require('ffmpeg');
var rimraf = require('rimraf');
var path = require('path');

if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun/*, thisArg*/) {
        'use strict';

        if (this === void 0 || this === null) {
            throw new TypeError();
        }

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== 'function') {
            throw new TypeError();
        }

        var res = [];
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i];

                // NOTE: Technically this should Object.defineProperty at
                //       the next index, as push can be affected by
                //       properties on Object.prototype and Array.prototype.
                //       But that method's new, and collisions should be
                //       rare, so use the more-compatible alternative.
                if (fun.call(thisArg, val, i, t)) {
                    res.push(val);
                }
            }
        }

        return res;
    };
}

exports.setAvaToUser = function(req,res,next){
    var format = req.files.file.type;
    var patt = /image/i;
    var formatCheck = patt.test(format);
    var dim = format.split('/');
    dim = dim[1];
    if(formatCheck){
        var filename = req.files.file.path;
        filename = filename.split('/');
        filename = filename.pop();
        async.series([
            function(callback){
                db.userDBModel.update({email:req.body.email},{name:req.body.user,ava:'ava.'+dim},{upsert:true},function(err){
                    if(err) return next(err);
                    callback(null, 'Created place in DB');
                });
            },
            function(callback){
                db.userDBModel.find({name:req.body.user,email:req.body.email},function(err,data){
                    if(err) return next(err);
                    console.log(data);
                    var id = data[0]._id;
                    fs.mkdir('public/uploaded/'+id, function(){
                        callback(null, id);
                    })
                })
            }
        ],
            function(err, results){
                var r = fs.createReadStream(req.files.file.path);
                var w = fs.createWriteStream('public/uploaded/'+results[1]+'/ava.'+dim);
                r.on('end', function() {
                    w.on('finish', function() {
                        var rg = fs.createReadStream('public/uploaded/'+results[1]+'/ava.'+dim);
                        var wg =  fs.createWriteStream('public/uploaded/'+results[1]+'/mini_ava.'+dim);
                        rg.on('end',function(){
                            wg.on('finish',function(){
                                res.status(200).send(results[1]+'/ava.'+dim)
                            });
                        });
                        gm(rg).resize(300)
                            .stream(function (err, stdout, stderr) {
                                if(err)res.status(200).send('error');
                                stdout.pipe(wg);
                            });
                    });
                });
                w.on('error', function() {
                    res.status(200).send('error');
                });
                r.on('error', function() {
                    res.status(200).send('error');
                });
                r.pipe(w);
            });
    }else{
        res.status(200).send('wrong');
    }
}


exports.saveUserData = function(req,res,next){
    var dateIncome = req.body.dateOfBirth;
    var dateOfBirdth = new Date(dateIncome);
    db.userDBModel.update({
        name:req.body.name,
        email:req.body.email
    },{
        password:req.body.passwordR,
        gender:req.body.gender,
        second_name: req.body.secondName,
        date_ofBirth: dateOfBirdth,
        place_ofBirth: req.body.placeOfBirth,
        languages_able: req.body.selectedLanguages,
        date_ofRegister: new Date(),
        about: req.body.about
    },
    {upsert:true},
        function(err){
        if(err) return next(err);
            db.userDBModel.find({name:req.body.name,email:req.body.email},function(err,info){
                if(err) return next(err);
                fs.mkdir('public/uploaded/'+info[0]._id,function(){
                    res.status(200).send(info[0]);
                });
            })
    })
}


exports.getUserInfo = function(req,res,next){
    db.userDBModel.find({_id:req.body.userId},function(err,data){
        if(err) return next(err);
        if(data.length!=0){
            res.status(200).send(data[0]);
        }else{
            var obj = {};
            obj.answer = 'nothing';
            res.status(200).send(obj);
        }
    });
}

//exports.deleteAvaFromUser = function(req,res,next){
//    var file = req.params.file;
//    fs.unlink(__dirname+'/../public/uploaded/'+file,function(err){
//        if(err) return next(err);
//        res.status(200).send();
//    })
//}

exports.changeAvaUser = function(req,res,next){
    var userId = req.body.userId;
    var oldAva = req.body.oldAva;
    var format = req.files.file.type;
    var patt = /image/i;
    var formatCheck = patt.test(format);
    var dim = format.split('/');
    dim = dim[1];
    if(formatCheck){
    fs.exists(__dirname+'/../public/uploaded/'+userId+'/'+oldAva, function (exists) {
        if(exists){
                    fs.unlink(__dirname+'/../public/uploaded/'+userId+'/'+oldAva,function(err){
                        if(err) return next(err);
                        fs.unlink(__dirname+'/../public/uploaded/'+userId+'/mini_'+oldAva,function(err){
                            if(err) return next(err);
                            var r = fs.createReadStream(req.files.file.path);
                            var w = fs.createWriteStream('public/uploaded/'+userId+'/ava.'+dim);
                            r.on('end', function() {
                                w.on('finish', function() {
                                    var rg = fs.createReadStream('public/uploaded/'+userId+'/ava.'+dim);
                                    var wg =  fs.createWriteStream('public/uploaded/'+userId+'/mini_ava.'+dim);
                                    rg.on('end',function(){
                                        wg.on('finish',function(){
                                            res.status(200).send('ava.'+dim);
                                        });
                                    });
                                    gm(rg).resize(300)
                                        .stream(function (err, stdout, stderr) {
                                            stdout.pipe(wg);
                                            if(err){
                                                res.status(200).send('error');
                                            }
                                        });
                                });
                            });
                            w.on('error', function() {
                                res.status(200).send('error');
                            });
                            r.on('error', function() {
                                res.status(200).send('error');
                            });
                            r.pipe(w);
                        })
                    })
        }else{
            fs.mkdir('public/uploaded/'+userId, function(){
                var r = fs.createReadStream(req.files.file.path);
                var w = fs.createWriteStream('public/uploaded/'+userId+'/ava.'+dim);
                r.on('end', function() {
                    w.on('finish', function() {
                        var rg = fs.createReadStream('public/uploaded/'+userId+'/ava.'+dim);
                        var wg =  fs.createWriteStream('public/uploaded/'+userId+'/mini_ava.'+dim);
                        rg.on('end',function(){
                            wg.on('finish',function(){
                                res.status(200).send('ava.'+dim);
                            });
                        });
                        gm(rg).resize(300)
                            .stream(function (err, stdout, stderr) {
                                stdout.pipe(wg);
                                if(err){
                                    res.status(200).send('error');
                                }
                            });
                    });
                });
                w.on('error', function() {
                    res.status(200).send('error');
                });
                r.on('error', function() {
                    res.status(200).send('error');
                });
                r.pipe(w);
            });
        }
    });
    }else{
        res.status(200).send('wrong');
    }
}

exports.deleteAva = function(req,res,next){
    var userId = req.body.userId;
    var ava = req.body.ava;
    fs.exists(__dirname+'/../public/uploaded/'+userId+'/maintainData/ava/'+ava, function (exists) {
        if(exists){
            db.userDBModel.update({_id:userId},{$unset:{ava:''}},function(err){
                if(err) return next(err);
                fs.unlink(__dirname+'/../public/uploaded/'+userId+'/maintainData/ava/'+ava,function(err){
                    if(err) return next(err);
                    fs.unlink(__dirname+'/../public/uploaded/'+userId+'/maintainData/ava/mini_'+ava,function(err){
                        if(err) return next(err);
                        fs.exists(__dirname+'/../public/uploaded/'+userId+'/maintainData/ava/mini_'+ava,function(exists){
                            if(!exists){
                                res.status(200).send();
                            }
                        })
                    });
                });
            });
        }else{
            db.userDBModel.update({_id:userId},{$unset:{ava:''}},function(err){
                if(err) return next(err);
                res.status(200).send();
            });
        }
    });
    fs.exists(__dirname+'/../public/uploaded/'+userId+'/maintainData/ava/new_'+ava,function(exists){
        if(exists){
            fs.unlink(__dirname+'/../public/uploaded/'+userId+'/maintainData/ava/new_'+ava,function(err){
                if(err) return next(err);
                fs.exists(__dirname+'/../public/uploaded/'+userId+'/maintainData/ava/new_'+ava,function(exists){
                    if(!exists){
                        res.status(200).send();
                    }
                })
            });
        }
    })
}
///home/vladimir050486/api
//path.join(__dirname, 'views')
//exports.insertAvaUser = function(req,res,next){
//    var userId = req.body.userId;
//    var format = req.files.file.type;
//    var patt = /image/i;
//    var formatCheck = patt.test(format);
//    var dim = format.split('/');
//    dim = dim[1];
//    if(formatCheck){
//        fs.mkdir(__dirname+'/../public/uploaded/'+userId);
//        var r = fs.createReadStream(req.files.file.path);
//        var w = fs.createWriteStream(path.join(__dirname,'../public/uploaded/'+userId+'/ava.'+dim));
//        r.on('end', function() {
//            w.on('finish', function() {
//                var rg = fs.createReadStream('public/uploaded/'+userId+'/ava.'+dim);
//                var wg =  fs.createWriteStream('public/uploaded/'+userId+'/mini_ava.'+dim);
//                rg.on('end',function(){
//                    wg.on('finish',function(){
//                        db.userDBModel.update({_id:userId},{ava:'ava.'+dim},{upsert:true},function(err){
////                            console.log(err);
//                            if(err) return next(err);
//                            res.status(200).send('ava.'+dim);
//                        })
//                    });
//                });
//                gm(rg).resize(300)
//                    .stream(function (err, stdout, stderr) {
//                        stdout.pipe(wg);
//                        if(err){
////                            console.log(err);
//                            res.status(200).send('error');
//                        }
//                    });
//            });
//        });
//        w.on('error', function() {
//            res.status(200).send('error');
//        });
//        r.on('error', function() {
//            res.status(200).send('error');
//        });
//        r.pipe(w);
//    }else{
//        res.status(200).send('wrong')
//    };
//}

exports.loginUser = function(req,res,next){
    var email = req.body.email;
    var pwd = req.body.pwd;
    db.userDBModel.find({email:email,password:pwd},function(err,data){
        if(err) return next(err);
        //console.log(data);
        res.status(200).send(data[0]);
    });
}

exports.checkEmailExist = function(req,res,next){
    var email = req.params.email;
    db.userDBModel.find({email:email},function(err,data){
        if(err) return next(err);
        res.status(200).send(data);
    });
}

//exports.insertPicturesUser = function(req,res,next){
//    var format = req.files.file.type;
//    var patt = /image/i;
//    var formatCheck = patt.test(format);
//    if(formatCheck){
//        var folder = req.body.folder;
//        var userId = req.body.userId;
//        var file = req.files.file.path.split('/');
//        file =  file.pop();
//        var date = new Date();
//        var obj = {};
//        obj.title = file;
//        obj.folder = folder;
//        obj.date = date;
//        fs.mkdir(__dirname+'/../public/uploaded/'+userId,function(){
//            fs.mkdir(__dirname+'/../public/uploaded/'+userId+'/'+folder,function(){
//                var r = fs.createReadStream(req.files.file.path);
//                var w = fs.createWriteStream('public/uploaded/'+userId+'/'+folder+'/'+file);
//                r.on('end', function() {
//                    w.on('finish', function() {
//                        var rg = fs.createReadStream('public/uploaded/'+userId+'/'+folder+'/'+file);
//                        var wg =  fs.createWriteStream('public/uploaded/'+userId+'/'+folder+'/mini_'+file);
//                        rg.on('end',function(){
//                            wg.on('finish',function(){
//                                db.userDBModel.update({_id:userId},{$push:{photos:obj}},{upsert:true},function(err,data){
//                                    if(err) return next(err);
//                                    res.status(200).send(file);
//                                })
//                            });
//                        });
//                        gm(rg).resize(300)
//                            .stream(function (err, stdout, stderr) {
//                                stdout.pipe(wg);
//                                if(err){
//                                    res.status(200).send('error');
//                                }
//                            });
//                    });
//                });
//                w.on('error', function() {
//                    res.status(200).send('error');
//                });
//                r.on('error', function() {
//                    res.status(200).send('error');
//                });
//                r.pipe(w);
//            });
//    });
//    }else{
//        res.status(200).send('wrong')
//    };
//}

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
            res.status(200).send(exArr);
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
            res.status(200).send(exArr);
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
            res.status(200).send(data);
        }
    );
}

exports.deletePicUser = function(req,res,next){
    var userId = req.params.userId;
    var pic = req.params.picture;
    var folder = req.params.folder;
    db.userDBModel.update({_id:userId},
        { $pull: { 'photos': {'folder':folder, 'title': pic} } },
        function(err,data){
            if(err) return next(err);
            fs.unlink(__dirname+'/../public/uploaded/'+userId+'/user/'+folder+'/'+pic,function(err){
                if(err) return next(err);
                fs.unlink(__dirname+'/../public/uploaded/'+userId+'/user/'+folder+'/mini_'+pic,function(err){
                    if(err) return next(err);
                    fs.readdir(__dirname+'/../public/uploaded/'+userId+'/user/'+folder, function(err, files){
                        if(files.length==0){
                            rimraf(__dirname+'/../public/uploaded/'+userId+'/user/'+folder,function(err){
                                if(err) return next(err);
                                res.status(200).send();
                            })
                        }else{
                            res.status(200).send();
                        }
                    })
                });
            });
        }
    );
}
//exports.insertVideosUser = function(req,res,next){
//    var format = req.files.file.type;
//    var patt = /video/i;
//    var formatCheck = patt.test(format);
//    if(formatCheck){
//        var folder = req.body.folder;
//        var userId = req.body.userId;
//        var file = req.files.file.path.split('/');
//        file =  file.pop();
//        var date = new Date();
//        var obj = {};
//        obj.title = file;
//        obj.folder = folder;
//        obj.date = date;
//        fs.mkdir(__dirname+'/../public/uploaded/'+userId,function(){
//            fs.mkdir(__dirname+'/../public/uploaded/'+userId+'/'+folder,function(){
//                try {
//                    var process = new ffmpeg(req.files.file.path);
//                    process.then(function (video) {
//                        video
//                            .setVideoFormat('mp4')
//                            .save('public/uploaded/'+userId+'/'+folder+'/'+file, function (error, file) {
//                                db.userDBModel.update({_id:userId},{$push:{videos:obj}},{upsert:true},function(err){
//                                    if(err) return next(err);
//                                    res.status(200).send(file);
//                                });
//                            });
//                    }, function (err) {
//                        res.status(200).send('error');
//                    });
//                } catch (e) {
//                    res.status(200).send('error');
//                }
//            });
//        });
//    }else{
//        res.status(200).send('wrong')
//    };
//}

//exports.videosInFolder = function(req,res,next){
//    var folder = req.params.folder;
//    var userId = req.params.userId;
//    db.userDBModel.aggregate({$unwind:'$videos'},
//        {
//            $match: {
//                $and: [
//                    {'_id': mongoose.Types.ObjectId(userId)},
//                    {'videos.folder':folder}
//                ]
//            }
//        },
//        { $group : { _id : "$videos.folder", videos: { $push: "$videos.title" } } },
//        function(err,data){
//            if(err) return next(err);
//            res.status(200).send(data);
//        }
//    );
//}

exports.deleteVideoUser = function(req,res,next){
    var userId = req.params.userId;
    var video = req.params.video;
    var folder = req.params.folder;
    db.userDBModel.update({_id:userId},
        { $pull: { 'videos': {'folder':folder,'title': video} } },
        function(err,data){
            if(err) return next(err);
            fs.unlink(__dirname+'/../public/uploaded/'+userId+'/user/'+folder+'/'+video,function(err){
                if(err) return next(err);
                fs.readdir(__dirname+'/../public/uploaded/'+userId+'/user/'+folder, function(err, files){
                    if(files.length==0){
                        rimraf(__dirname+'/../public/uploaded/'+userId+'/user/'+folder,function(err){
                            if(err) return next(err);
                            res.status(200).send();
                        })
                    }else{
                        res.status(200).send();
                    }
                })
            });
        }
    );
}

exports.deleteAudioUser = function(req,res,next){
    var userId = req.params.userId;
    var audio = req.params.audio;
    var folder = req.params.folder;
    db.userDBModel.update({_id:userId},
        { $pull: { 'audio': {'folder':folder, 'title': audio} } },
        function(err,data){
            if(err) return next(err);
            fs.unlink(__dirname+'/../public/uploaded/'+userId+'/user/'+folder+'/'+audio,function(err){
                if(err) return next(err);
                fs.readdir(__dirname+'/../public/uploaded/'+userId+'/user/'+folder, function(err, files){
                    if(files.length==0){
                        rimraf(__dirname+'/../public/uploaded/'+userId+'/user/'+folder,function(err){
                            if(err) return next(err);
                            res.status(200).send();
                        })
                    }else{
                        res.status(200).send();
                    }
                })
            });
        }
    );
}

exports.searchPersonByName = function(req,res,next){
    db.userDBModel.find({name:{$regex:req.params.name,$options:'i'}},function(err,data){
        if(err) return next(err);
        res.status(200).send(data);
    });
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
                    curs = curs.find({name:{$regex:name,$options:'i'}},function(err,data){
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
                    curs = curs.find({second_name:{$regex:secondName,$options:'i'}},function(err,data){
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
                    curs = curs.find({date_ofBirth:{$gte:dateOfBirthFrom,$lt:dateOfBirthTill}},function(err,data){
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
                        curs = curs.find({date_ofBirth:{$lt:pastFull}},function(err,data){
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
                        curs = curs.find({date_ofBirth:{$gte:futureFull}},function(err,data){
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
                res.status(200).send(obj);
            });
    })
}

exports.addToFriends = function(req,res,next){
    var friendsId = req.body.id;
    var myId = req.body.myId;
    db.userDBModel.update({_id:myId},{$addToSet:{friends:friendsId}},function(err,data){
        if(err) return next(err);
        res.status(200).send();
    });
}

exports.deleteFromFriends = function(req,res,next){
    var friendsId = req.body.id;
    var myId = req.body.myId;
    db.userDBModel.update({_id:myId},{$pull:{friends:friendsId}},function(err,data){
        if(err) return next(err);
        res.status(200).send();
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
    var newPassword = req.body.newPassword;

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
            if(newPassword){
                db.userDBModel.update({_id:id},{
                    password:newPassword
                },function(err){
                    if(err) return next(err);
                    callback(null, 'newPassword');
                });
            }else{
                callback(null, 'newPassword');
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
            res.status(200).send();
        });
}

exports.auth = function(req,res,next){
    if (!req.isAuthenticated()){
        res.status(401).send()
    }else{
        next()
    }
}
exports.searchEvents = function(req,res,next){
    var location = req.params.location;
    db.eventsDBModel.find({destination:{$regex:location,$options:'i'}},function(err,data){
        if(err) return next(err);
        res.status(200).send(data);
    })
}
exports.getAddedEvents = function(req,res,next){
    var userId = req.params.userId;
    db.eventsDBModel.find({party:userId},function(err,data){
        if(err) return next(err);
        res.status(200).send(data);
    })
}
exports.addMeToEvent = function(req,res,next){
    var eventTitle = req.params.eventTitle;
    var userId = req.params.userId;
    db.eventsDBModel.update({title:eventTitle},{$addToSet:{party:userId}},function(err){
        if(err) return next(err);
        res.status(200).send();
    });
}
exports.infoEvent = function(req,res,next){
    var eventId = req.params.eventId;
    db.eventsDBModel.find({_id:eventId},function(err,data){
        if(err) return next(err);
        res.status(200).send(data);
    })
}
exports.infoEventChanges = function(req,res,next){
    var eventId = req.params.eventId;
    var userId = req.params.userId;
    db.userDBModel.update({_id:userId},{$addToSet:{changesFound:eventId}},function(err){
        if(err) return next(err);
        res.status(200).send();
    });
}
exports.deleteMeFromEvent = function(req,res,next){
    var eventId = req.params.eventId;
    var userId = req.params.userId;
    db.eventsDBModel.update({_id:eventId},{$pull:{party:userId}},function(err){
        if(err) return next(err);
        res.status(200).send();
    });
}
//exports.insertPicturesEvent = function(req,res,next){
//    var format = req.files.file.type;
//    var patt = /image/i;
//    var formatCheck = patt.test(format);
//    if(formatCheck){
//        var filename = req.files.file.path;
//        filename = filename.split('/');
//        filename = filename.pop();
//        var r = fs.createReadStream(req.files.file.path);
//        var w = fs.createWriteStream('public/uploaded/'+req.body.userId+'/'+filename);
//        r.on('end', function() {
//            w.on('finish', function() {
//                var rg = fs.createReadStream('public/uploaded/'+req.body.userId+'/'+filename);
//                var wg =  fs.createWriteStream('public/uploaded/'+req.body.userId+'/mini'+filename);
//                rg.on('end',function(){
//                    wg.on('finish',function(){
//                        db.eventsDBModel.update({owner:req.body.userId,title:req.body.eventTitle},{$push:{photos:filename}},{upsert:true},function(err){
//                            if(err) return next(err);
//                            res.status(200).send(filename);
//                        });
//                    });
//                });
//                gm(rg).resize(300)
//                    .stream(function (err, stdout, stderr) {
//                        stdout.pipe(wg);
//                        if(err){
//                            res.status(200).send('Miniature was not created. Try again.');
//                            console.log('Miniature was not created. Try again.');
//                        }
//                    });
//            });
//        });
//        w.on('error', function() {
//            res.status(200).send('Upload failed. Try again.');
//            console.log('Writing failed. Try again.');
//        });
//        r.on('error', function() {
//            res.status(200).send('Upload failed. Try again.');
//            console.log('Reading failed. Try again.');
//        });
//        r.pipe(w);
//    }else{
//        res.status(200).send('Wrong format.');
//    }
//}
exports.makeChanges = function(req,res,next){
    var title = req.params.title;
    var id = req.params.id;
    var date = new Date();
    if(title=='events'){
        db.userDBModel.update({changesFound:id},{$pull:{changesFound:id}},function(err){
           if(err) return next(err);
            db.changesDBModel.update({eventId:id},{date:date},{upsert:true},function(err){
                if(err) return next(err);
                res.status(200).send();
            });
        });
    }
}
exports.getChanges = function(req,res,next){
    db.changesDBModel.find({},function(err,data){
        if(err) return next(err);
        res.status(200).send(data);
    })
}


exports.deletePicEvent = function(req,res,next){
    var userId = req.params.userId;
    var pic = req.params.picture;
    var title = req.params.title;
    db.eventsDBModel.update({owner:userId,title:title},
            { $pull: { 'photos': {'title': pic} } },
            function(err,data){
                if(err) return next(err);
                fs.unlink(__dirname+'/../public/uploaded/'+userId+'/event/'+title+'/'+pic,function(err){
                    if(err) return next(err);
                    fs.unlink(__dirname+'/../public/uploaded/'+userId+'/event/'+title+'/mini_'+pic,function(err){
                        if(err) return next(err);
                        fs.readdir(__dirname+'/../public/uploaded/'+userId+'/event/'+title, function(err, files){
                            if(files.length==0){
                                rimraf(__dirname+'/../public/uploaded/'+userId+'/event/'+title,function(err){
                                    if(err) return next(err);
                                    res.status(200).send();
                                })
                            }else{
                                res.status(200).send();
                            }
                        })
                    });
                });
            }
        );
}

exports.deleteVideoEvent = function(req,res,next){
    var userId = req.params.userId;
    var video = req.params.video;
    var title = req.params.title;
    db.eventsDBModel.update({owner:userId,title:title},
        { $pull: { 'videos': {'title': video} } },
        function(err,data){
            if(err) return next(err);
            fs.unlink(__dirname+'/../public/uploaded/'+userId+'/event/'+title+'/'+video,function(err){
                if(err) return next(err);
                    fs.readdir(__dirname+'/../public/uploaded/'+userId+'/event/'+title, function(err, files){
                        if(files.length==0){
                            rimraf(__dirname+'/../public/uploaded/'+userId+'/event/'+title,function(err){
                                if(err) return next(err);
                                res.status(200).send();
                            })
                        }else{
                            res.status(200).send();
                        }
                    })
            });
        }
    );
}

exports.deleteAudioEvent = function(req,res,next){
    var userId = req.params.userId;
    var audio = req.params.audio;
    var title = req.params.title;
    db.eventsDBModel.update({owner:userId,title:title},
        { $pull: { 'audio': {'title': audio} } },
        function(err,data){
            if(err) return next(err);
            fs.unlink(__dirname+'/../public/uploaded/'+userId+'/event/'+title+'/'+audio,function(err){
                if(err) return next(err);
                    fs.readdir(__dirname+'/../public/uploaded/'+userId+'/event/'+title, function(err, files){
                        if(files.length==0){
                            rimraf(__dirname+'/../public/uploaded/'+userId+'/event/'+title,function(err){
                                if(err) return next(err);
                                res.status(200).send();
                            })
                        }else{
                            res.status(200).send();
                        }
                    })
            });
        }
    );
}

exports.createEvent = function(req,res,next){
    var today = new Date();
    if(!req.body.phone){
       var phone = '';
    }else{
        var phone = req.body.phone;
    }
    if(!req.body.addressInCity){
        var addressInCity = '';
    }else{
        var addressInCity = req.body.addressInCity;
    }
    db.eventsDBModel.update({owner:req.body.userId,title:req.body.title},{
        date_created:today,date_exec: req.body.executionDate, about:req.body.about, destination:req.body.eventLocationCity, coords:req.body.coords,addressInCity:addressInCity,phone:phone
    },{upsert:true},function(err){
        if(err) console.log(err);
        db.executedDBModel.update({owner:req.body.userId,title:req.body.title},{
            date_created:today,date_exec: req.body.executionDate, about:req.body.about, destination:req.body.eventLocationCity, coords:req.body.coords,addressInCity:addressInCity,phone:phone
        },{upsert:true},function(err){
            if(err) console.log(err);
            res.status(200).send();
        });
    });
}
exports.getEventsStart = function(req,res,next){
    var userId = req.params.userId;
    db.userDBModel.find({_id:userId},{destination:1},function(err,data){
        if(err) return next(err);
        db.eventsDBModel.find({destination:data[0].destination,owner:{$ne:userId}},function(err,info){
            if(err) return next(err);
            res.status(200).send(info);
        });
    })
}

exports.deleteMyEvent = function(req,res,next){
    var userId = req.params.userId,
        title = req.params.title,
        type = 'event',
        files,
        photos,videos,slider,audio,
        i,l;

    db.eventsDBModel.find({owner:userId,title:title},function(err,data){
        if(err) console.log(err);
        photos = data[0].photos || [];
        videos = data[0].videos || [];
        slider = data[0].slider || [];
        audio = data[0].audio || [];
        files = [];
        files.push(photos.slice(photos));
        files.push(videos.slice(videos));
        console.log(files);
    })
}
exports.getMyEvents = function(req,res,next){
    db.eventsDBModel.find({owner:req.params.userId},function(err,data){
        if(err) return next(err);
        res.status(200).send(data);
    });
}
exports.pasteUserFace = function(profile){
    db.userDBModel.update({facebookId:profile._json.id},{name:profile._json.first_name,second_name:profile._json.last_name,gender:profile._json.gender,facebook:profile._json.link,email:profile._json.email},{upsert:true},function(err){
        if(err) console.log(err);
    })
}

exports.pasteUserVkontakte = function(profile){
    db.userDBModel.update({vkId:profile.id},{name:profile.name.givenName,second_name:profile.name.familyName,gender:profile.gender,vk:profile.profileUrl},{upsert:true},function(err){
        if(err) console.log(err);
    })
}

exports.pasteUserGoogle = function(profile){
    db.userDBModel.update({googleId:profile._json.id},{name:profile._json.name.givenName,second_name:profile._json.name.familyName,gender:profile._json.gender,google:profile._json.url},{upsert:true},function(err){
        if(err) console.log(err);
    })
}

exports.getUserWithFacebook = function(req,res,next){
    var facebookId = req.body.id;
    db.userDBModel.find({facebookId:facebookId},function(err,data){
        if(err) return next(err);
        var obj = {};
        obj.res = data;
        res.status(200).send(obj);
    });
}
exports.getUserWithVk = function(req,res,next){
    var vkId = req.body.id;
    db.userDBModel.find({vkId:vkId},function(err,data){
        if(err) return next(err);
        var obj = {};
        obj.res = data;
        res.status(200).send(obj);
    });
}
exports.getUserWithGoogle = function(req,res,next){
    var googleId = req.body.id;
    db.userDBModel.find({googleId:googleId},function(err,data){
        if(err) return next(err);
        var obj = {};
        obj.res = data;
        res.status(200).send(obj);
    });
}
exports.getUserWithLocal = function(req,res,next){
    var localId = req.body.id;
    db.userDBModel.find({_id:localId},function(err,data){
        if(err) return next(err);
        var obj = {};
        obj.res = data;
        res.status(200).send(obj);
    });
}
exports.loginLocal = function(req,res,next){
    db.userDBModel.find({email:req.body.email,password:req.body.pwd},function(err,data){
        if(err) return next(err);
        res.status(200).send(data[0]);
    })
}
exports.deleteMe = function(req,res,next){
    var user = req.body.userId;
    var pwd = req.body.userPwd;
        db.userDBModel.find({_id:user,password: pwd},function(err,data){
            if(err) return next(err);
            if(data){
                async.series([
                    //delete total user
                    function(callback){
                        //delete all files in folder rimraf(f, callback)
                        rimraf(__dirname+'/../public/uploaded/'+user,function(err){
                            if(err) return next(err);
                            callback(null, 'files deleted');
                        })
                    },
                    function(callback){
                        //all user info deletion
                        db.userDBModel.remove({_id:user,password: pwd},function(err){
                            if(err) return next(err);
                            callback(null, 'all data user removed');
                        });
                    },
                    function(callback){
                        db.eventsDBModel.remove({owner:user},function(err){
                            if(err) return next(err);
                            callback(null, 'all owners events removed');
                        });
                    },
                    function(callback){
                        db.eventsDBModel.update({party:user},{$pull:{party:user}},function(err){
                            if(err) return next(err);
                            callback(null, 'all data events removed');
                        });
                    }
                ],
                    function(err, results){
                        if(err) return next(err);
                        res.status(200).send('bie');
                    });
            }else{
                res.status(200).send('bie');
            }
        });
}
exports.getMsgs = function(req,res,next){
    var userId = req.params.userId;
    db.msgsDBModel.find({toId:userId,read:false},function(err,data){
        if(err) return next(err);
        res.status(200).send(data);
    });
}
exports.getUnsetMsgs = function(req,res,next){
    var userId = req.params.userId;
    db.msgsDBModel.find({toId:userId,read:false},function(err,data){
        if(err) return next(err);
        db.msgsDBModel.update({toId:userId,read:false},{read:true},function(err){
            if(err) return next(err);
            res.status(200).send(data);
        });
    });
}

