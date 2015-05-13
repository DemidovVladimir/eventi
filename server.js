var express = require('express');
var app = express();




var http = require('http').Server(app);

var logger = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var api = require('./api/index.js');
var io = require('socket.io')(http);
var db = require('./data/db.js');
var rimraf = require('rimraf');
var async = require('async');
var exec = require('child_process').exec;
var gm = require('gm');
var ffmpeg = require('fluent-ffmpeg');
var btoa = require('btoa');
var util = require('util');























//Configure passport and sign in with social networks
var passport = require('passport')
    , FacebookStrategy = require('passport-facebook').Strategy
        ,VKontakteStrategy = require('passport-vkontakte').Strategy;
var GoogleStrategy = require( 'kroknet-passport-google-oauth' ).Strategy;

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});
passport.use(new FacebookStrategy({
        clientID: '717804074963172',
        clientSecret: 'fbd6d7cbae2e252b62cb737a0249d4b5',
        callbackURL: "https://enveti.com/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        //console.log(profile);
        //return done(null,profile);
        api.pasteUserFace(profile);
        return done(null,profile.id);
    }
));

// end of configuring passport

















//// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(favicon(path.join(__dirname, 'public/img/mini_logo.ico')));
app.use(logger('dev'));
app.use(methodOverride());
app.use(session({
    secret: 'MEANdevelopment',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
app.use(logErrors);
app.use(clientErrorHandler);
if ('development' == app.get('env')) {
    app.use(errorHandler);
}


var connected = [];

var chatLine = io.of('/chat');
chatLine.on('connection', function(socket){
    socket.on('connect me',function(user){
        connected.push(user);
        socket.join(user);
        socket.on('message',function(msg){
            var answer = {};
            answer.userFromId = msg.userFromId;
            answer.userFromName = msg.userFromName;
            answer.msg = msg.msg;
            answer.userToId = msg.userToId;
            answer.userToName = msg.userToName;
            if(connected.indexOf(msg.userToId)!=-1){
                db.msgsDBModel.create({fromId:msg.userFromId,fromName:msg.userFromName,toId:msg.userToId,toName:msg.userToName,read:true,msg:msg.msg},function(err){
                    if(err) return next(err);
                });
            }else{
                db.msgsDBModel.create({fromId:msg.userFromId,fromName:msg.userFromName,toId:msg.userToId,toName:msg.userToName,read:false,msg:msg.msg},function(err){
                    if(err) return next(err);
                });
            }
            chatLine.to(msg.userToId).emit('message',answer);
            chatLine.to(user).emit('message',answer);
        });
        socket.on('disconnect', function(){
            var intAr = connected.indexOf(user);
            connected.splice(intAr,1);
            socket.leave(user);
        });
    });
});
var connectedMaintain = [];
var maintainLine = io.of('/maintainUser');
maintainLine.on('connection', function(socket){
    socket.on('unlink me',function(user){
        var ind = connectedMaintain.indexOf(user);
        if(connectedMaintain.indexOf(user)!=-1){
            connectedMaintain.splice(ind,1);
        }
    })
    socket.on('connect me',function(user){
        connectedMaintain.push(user);
        socket.on('disconnect', function(){
            if(connectedMaintain.indexOf(user)!=-1){
                async.series([
                    function(callback){
                        //all user info deletion
                        db.userDBModel.remove({_id:user},function(err){
                            if(err) return next(err);
                            callback(null, 'all data user removed');
                        });
                    }
                ],
                    function(err, results){
                        if(err) return next(err);
                    });
            }
        });
    })
});

var Files = {};
var nameToWrite;
var fileStream = io.of('/fileTransfer');
fileStream.on('connection', function(socket){
    //title of the file
    var title;
    //pattern checking file
    var pattVideo = new RegExp("video");
    var pattImage = new RegExp("image");
    var pattMusic = new RegExp("audio");
    //type of the file
    var typeVideo;
    var typeImage;
    var typeMusic;
    //file size
    var size;
    //can be event or user
    var toType;
    //user sending file
    var userId;
    //can be slider, ava or simple pic, video, audio
    var destination;
    //title of the event
    var additionalTitle;
    //check video and audio format
    var fileFormat;
    //folder for db
    var folder;
    //if file exists
    var fileExists;
    //collecting file
    var file = {};
    //order of picture in slider
    var orderSlider;
    socket.on('Start',function(data){
        async.series([
            function(callback){
                title = data.Name;
                typeVideo = pattVideo.test(data.Type);
                typeImage = pattImage.test(data.Type);
                typeMusic = pattMusic.test(data.Type);
                size = data.Size;
                file.size = data.Size;
                file.downloaded = 0;
                toType = data.toType;
                userId = data.UserId;
                destination = data.additionalAttrs.destination;
                additionalTitle = data.additionalAttrs.title;
                fileFormat = data.Type.split('/').pop();
                folder = data.Folder || 'default';
                orderSlider = data.orderSlider-1;
                callback(null,'inheritance');
            },
            function(callback){
                fs.mkdir('public/uploaded/'+userId+'/'+toType,function(){
                    callback(null, 'mkdir');
                });
            },
            function(callback){
                if(fileFormat!='jpeg' && fileFormat!='png' && fileFormat!='mp4' && fileFormat!='mp3' && fileFormat!='mpeg'){
                    callback(null,{formatError:true});
                }else{
                    callback(null,{formatError:false});
                }
            },
            function(callback){
                fs.exists('public/uploaded/'+userId+'/'+toType+'/'+title, function (exists) {
                    fileExists = exists;
                    callback(null,'existence');
                });
            }
        ],function(err,results){
            if(err) console.log(err);
            if(results[2].formatError==true){
                socket.emit('dropError',{answer:'Wrong data format, please use jpeg, png, mp4 or mp3'});
            }else{
                socket.emit('moreData',{Percent:1,Place:0});
            }
        })
    });



    socket.on('UploadImage',function(data){
        async.waterfall([
            function(callback){
                if(data.startData!='empty'){
                    if(fileExists){
                        var dataStart = btoa(data.startData);
                            fs.createReadStream('public/uploaded/'+userId+'/'+toType+'/'+title, {
                                'flags': 'r',
                                'encoding': 'binary',
                                'mode': 0666,
                                'start':100,
                                'end':200
                            }).addListener( "data", function(chunk) {
                                var chunkData = btoa(chunk);
                                if(chunkData==dataStart){
                                    var Stat = fs.statSync('public/uploaded/'+userId+'/'+toType+'/'+title);
                                    if(file.size==Stat.size){
                                        socket.emit('Done');
                                        callback(null,{title:title,useDB:true,uploaded:true});
                                    }else{
                                        file.downloaded = Stat.size;
                                        callback(null,{title:title,useDB:false,uploaded:false});
                                    }
                                }else{
                                    var newTitle = title.splice('.');
                                    var formatFile = newTitle.pop();
                                    newTitle = title.splice(formatFile);
                                    newTitle = newTitle[0]+1;
                                    title = newTitle+'.'+formatFile;
                                    callback(null,{title:title,useDB:true,uploaded:false});
                                }
                            })
                    }else{
                        callback(null,{title:title,useDB:true,uploaded:false});
                    }
                }else{
                    callback(null,{title:title,useDB:false,uploaded:false});
                }
            },function(fileState,callback){
                if(fileState.useDB){
                    if(toType=='user'){
                        if(destination=='ava'){
                            db.userDBModel.update({_id:userId},{ava:{title:title}},function(err){
                                if(err) console.log(err);
                                callback(null,fileState);
                            });
                        }else{
                            var objFile = {folder:folder,title:title};
                            db.userDBModel.update({_id:userId},{$push:{photos:objFile}},{upsert:true},function(err){
                                if(err) return next(err);
                                callback(null,fileState);
                            });
                        }
                    }else{
                        if(destination=='slider'){
                            db.eventsDBModel.find({owner:userId,title:additionalTitle},function(err,event){
                                if(err) console.log(err);
                                var allPics;
                                async.waterfall([
                                    function(callback){
                                        if(event.length==0){
                                            allPics = [];
                                            allPics.push(title);
                                            callback(null,{end:true});
                                        }else{
                                            callback(null,{end:false});
                                        }
                                    },function(result,callback){
                                        if(result.end){
                                            callback(null,{end:true});
                                        }else{
                                            if(!event[0].slider){
                                                allPics = [];
                                                allPics.push(title);
                                                callback(null,{end:true});
                                            }else{
                                                callback(null,{end:false});
                                            }
                                        }
                                    },function(result,callback){
                                        if(result.end){
                                            callback(null,{end:true});
                                        }else{
                                            if(event[0].slider.length==0){
                                                allPics = [];
                                                allPics.push(title);
                                                callback(null,{end:true});
                                            }else{
                                                callback(null,{end:false});
                                            }
                                        }
                                    },function(result,callback){
                                        if(result.end){
                                            callback(null,{end:true});
                                        }else{
                                            if(event[0].slider.length<orderSlider){
                                                allPics = event[0].slider;
                                                allPics.push(title);
                                                callback(null,{end:true});
                                            }else{
                                                callback(null,{end:false});
                                            }
                                        }
                                    },function(result,callback){
                                        if(result.end){
                                            callback(null,{end:true});
                                        }else{
                                            if(orderSlider<event[0].slider.length){
                                                allPics=event[0].slider;
                                                allPics.splice(orderSlider,0,title);
                                                callback(null,{end:true});
                                            }else{
                                                callback(null,{end:true});
                                            }
                                        }
                                    }
                                ],function(err,results){
                                    if(err) console.log(err);
                                    db.eventsDBModel.update({owner:userId,title:additionalTitle},{slider:allPics},{upsert:true},function(err){
                                        if(err) console.log(err);
                                        db.executedDBModel.update({owner:userId,title:additionalTitle},{slider:allPics},{upsert:true},function(err){
                                            if(err) console.log(err);
                                            callback(null,fileState);
                                        });
                                    });
                                })
                            })
                        }else{
                            //for not slider
                            var objFile = {folder:folder,title:title};
                            db.eventsDBModel.update({owner:userId,title:additionalTitle},{$push:{photos:objFile}},{upsert:true},function(err){
                                if(err) return next(err);
                                db.executedDBModel.update({owner:userId,title:additionalTitle},{$push:{photos:objFile}},{upsert:true},function(err){
                                    if(err) return next(err);
                                    callback(null,fileState);
                                });
                            });
                        }
                    }
                }else{
                    callback(null,fileState);
                }
            }
        ],function(err,results){
            if(err) console.log(err);
            if(file.downloaded == file.size)results.uploaded = true;
            if(results.uploaded==true){
                fs.exists('public/uploaded/'+userId+'/'+toType+'/mini_'+title, function (exists) {
                    if(!exists){
                        var rr = fs.createReadStream('public/uploaded/'+userId+'/'+toType+'/'+title);
                        var w =  fs.createWriteStream('public/uploaded/'+userId+'/'+toType+'/mini_'+title);
                        gm(rr).resize(300)
                            .stream(function (err, stdout, stderr) {
                                stdout.pipe(w);
                                if(err){
                                    console.log(err);
                                }else{
                                    socket.emit('Done');
                                }
                            });
                    }else{
                        socket.emit('Done');
                    }
                });
            }else{
                fs.appendFile('public/uploaded/'+userId+'/'+toType+'/'+title, data['Data'],{encoding : 'binary'},function(err){
                    if(err) console.log(err);
                    file.downloaded+=data['Data'].length;
                    var Place = file.downloaded/10487;
                    var Percent = (file.downloaded / file.size) * 100;
                    socket.emit('moreData', { 'Place' : Place, 'Percent' :  Percent});
                });
            }
        })
    });

    socket.on('UploadVideo',function(data){
        async.waterfall([
            function(callback){
                if(data.startData!='empty'){
                    if(fileExists){
                        var dataStart = btoa(data.startData);
                        fs.createReadStream('public/uploaded/'+userId+'/'+toType+'/'+title, {
                            'flags': 'r',
                            'encoding': 'binary',
                            'mode': 0666,
                            'start':100,
                            'end':200
                        }).addListener( "data", function(chunk) {
                            var chunkData = btoa(chunk);
                            if(chunkData==dataStart){
                                var Stat = fs.statSync('public/uploaded/'+userId+'/'+toType+'/'+title);
                                if(file.size==Stat.size){
                                    socket.emit('Done');
                                    callback(null,{title:title,useDB:true,uploaded:true});
                                }else{
                                    file.downloaded = Stat.size;
                                    callback(null,{title:title,useDB:false,uploaded:false});
                                }
                            }else{
                                var newTitle = title.splice('.');
                                var formatFile = newTitle.pop();
                                newTitle = title.splice(formatFile);
                                newTitle = newTitle[0]+1;
                                title = newTitle+'.'+formatFile;
                                callback(null,{title:title,useDB:true,uploaded:false});
                            }
                        })
                    }else{
                        callback(null,{title:title,useDB:true,uploaded:false});
                    }
                }else{
                    callback(null,{title:title,useDB:false,uploaded:false});
                }
            },function(fileState,callback){
                if(fileState.useDB){
                    if(toType=='user'){
                        var objFile = {folder:folder,title:title};
                        db.userDBModel.update({_id:userId},{$push:{videos:objFile}},{upsert:true},function(err){
                            if(err) return next(err);
                            callback(null,fileState);
                        });
                    }else{
                        var objFile = {folder:folder,title:title};
                        db.eventsDBModel.update({owner:userId,title:additionalTitle},{$push:{videos:objFile}},{upsert:true},function(err){
                            if(err) return next(err);
                            db.executedDBModel.update({owner:userId,title:additionalTitle},{$push:{videos:objFile}},{upsert:true},function(err){
                                if(err) return next(err);
                                callback(null,fileState);
                            });
                        });
                    }
                }else{
                    callback(null,fileState);
                }
            }
        ],function(err,results){
            if(err) console.log(err);
            if(file.downloaded == file.size)results.uploaded = true;
            if(results.uploaded==true){
                socket.emit('Done');
            }else{
                fs.appendFile('public/uploaded/'+userId+'/'+toType+'/'+title, data['Data'],{encoding : 'binary'},function(err){
                    if(err) console.log(err);
                    file.downloaded+=data['Data'].length;
                    var Place = file.downloaded/10487;
                    var Percent = (file.downloaded / file.size) * 100;
                    socket.emit('moreData', { 'Place' : Place, 'Percent' :  Percent});
                });
            }
        })
    });

    socket.on('UploadAudio',function(data){
        async.waterfall([
            function(callback){
                if(data.startData!='empty'){
                    if(fileExists){
                        var dataStart = btoa(data.startData);
                        fs.createReadStream('public/uploaded/'+userId+'/'+toType+'/'+title, {
                            'flags': 'r',
                            'encoding': 'binary',
                            'mode': 0666,
                            'start':100,
                            'end':200
                        }).addListener( "data", function(chunk) {
                            var chunkData = btoa(chunk);
                            if(chunkData==dataStart){
                                var Stat = fs.statSync('public/uploaded/'+userId+'/'+toType+'/'+title);
                                if(file.size==Stat.size){
                                    socket.emit('Done');
                                    callback(null,{title:title,useDB:true,uploaded:true});
                                }else{
                                    file.downloaded = Stat.size;
                                    callback(null,{title:title,useDB:false,uploaded:false});
                                }
                            }else{
                                var newTitle = title.splice('.');
                                var formatFile = newTitle.pop();
                                newTitle = title.splice(formatFile);
                                newTitle = newTitle[0]+1;
                                title = newTitle+'.'+formatFile;
                                callback(null,{title:title,useDB:true,uploaded:false});
                            }
                        })
                    }else{
                        callback(null,{title:title,useDB:true,uploaded:false});
                    }
                }else{
                    callback(null,{title:title,useDB:false,uploaded:false});
                }
            },function(fileState,callback){
                if(fileState.useDB){
                    if(toType=='user'){
                        var objFile = {folder:folder,title:title};
                        db.userDBModel.update({_id:userId},{$push:{audio:objFile}},{upsert:true},function(err){
                            if(err) return next(err);
                            callback(null,fileState);
                        });
                    }else{
                        var objFile = {folder:folder,title:title};
                        db.eventsDBModel.update({owner:userId,title:additionalTitle},{$push:{audio:objFile}},{upsert:true},function(err){
                            if(err) return next(err);
                            db.executedDBModel.update({owner:userId,title:additionalTitle},{$push:{audio:objFile}},{upsert:true},function(err){
                                if(err) return next(err);
                                callback(null,fileState);
                            });
                        });
                    }
                }else{
                    callback(null,fileState);
                }
            }
        ],function(err,results){
            if(err) console.log(err);
            if(file.downloaded == file.size)results.uploaded = true;
            if(results.uploaded==true){
                socket.emit('Done');
            }else{
                fs.appendFile('public/uploaded/'+userId+'/'+toType+'/'+title, data['Data'],{encoding : 'binary'},function(err){
                    if(err) console.log(err);
                    file.downloaded+=data['Data'].length;
                    var Place = file.downloaded/10487;
                    var Percent = (file.downloaded / file.size) * 100;
                    socket.emit('moreData', { 'Place' : Place, 'Percent' :  Percent});
                });
            }
        })
    });
});















//Msgs
app.get('/getMsgs/:userId',api.getMsgs);
app.get('/getUnsetMsgs/:userId',api.getUnsetMsgs);
//Msgs

//Manipulation with stuff
//app.post('/setAva/user',api.setAvaToUser);


app.post('/saveUserData', api.saveUserData);
app.post('/getUserInfo',api.getUserInfo);
app.post('/changeAvaUser',api.changeAvaUser);
//app.post('/insertAvaUser',api.insertAvaUser);
//app.post('/insertPicturesUser',api.insertPicturesUser);
app.get('/checkEmailExist/:email',api.checkEmailExist);
app.post('/deleteAva',api.deleteAva);


app.post('/deleteMe',api.deleteMe);




app.get('/foldersList/:userId',api.foldersList);
app.get('/picsInFolder/:userId/:folder',api.picsInFolder);


app.get('/deletePicUser/:userId/:folder/:picture',api.deletePicUser);


app.get('/foldersVideo/:userId',api.foldersVideo);
//app.post('/insertVideosUser',api.insertVideosUser);
//app.get('/videosInFolder/:userId/:folder',api.videosInFolder);


app.get('/deleteVideoUser/:userId/:folder/:video',api.deleteVideoUser);
app.get('/deleteAudioUser/:userId/:folder/:audio',api.deleteAudioUser);


app.post('/searchPerson',api.searchPerson);
app.get('/searchPersonByName/:name',api.searchPersonByName);
app.post('/addToFriends',api.addToFriends);
app.post('/deleteFromFriends',api.deleteFromFriends);
app.post('/makeChangesUser', api.makeChangesUser);

//End of manipulations



//Map
//app.get('/searchMap/:mapDet',api.searchMap);
//Map


//oAuth routes and manipulations with auth(FB, VK, Google, Local)
//faceBook
app.get('/auth/facebook',
    passport.authenticate('facebook', { scope: 'read_stream' })
);
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { successRedirect: '/success/facebook',
        failureRedirect: '/loginUser' }));




//VK
passport.use(new VKontakteStrategy({
        clientID:     '4653096', // VK.com docs call it 'API ID'
        clientSecret: 'PQTJat0GZRWfVnulVUis',
        callbackURL:  "https://enveti.com/auth/vkontakte/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        api.pasteUserVkontakte(profile);
        return done(null,profile.id);
    }
));
app.get('/auth/vkontakte',
    passport.authenticate('vkontakte', { scope: 'read_stream'},
    function(req,res){
    })
);
app.get('/auth/vkontakte/callback',
    passport.authenticate('vkontakte', { successRedirect: '/success/vk',
        failureRedirect: '/loginUser' }));




//Google
passport.use(new GoogleStrategy({
        clientID:     '475991763822-q8p9t2p9f143ivrep5878gdvindipc63.apps.googleusercontent.com',
        clientSecret: 'S40fFKxvEMRP71qIzXbrP4rf',
        callbackURL: "https://enveti.com/auth/google/callback",
        passReqToCallback   : true
    },
    function(request, accessToken, refreshToken, profile, done) {
        api.pasteUserGoogle(profile);
        return done(null,profile.id);
    }
));
app.get('/auth/google',
    passport.authenticate('google', { scope:
            'https://www.googleapis.com/auth/plus.login'}
    ));
app.get( '/auth/google/callback',
    passport.authenticate( 'google', { successRedirect: '/success/google',
        failureRedirect: '/loginUser' }));





app.get('/success/:sn',function(req,res,next){
    var sn = req.param('sn');
        if(sn=='vk'){
            db.userDBModel.find({vkId:req._passport.session.user},function(err,data){
                if(err) return next(err);
                res.redirect('/maintainUser'+data[0]._id);
            });
        }else if(sn=='google'){
            db.userDBModel.find({googleId:req._passport.session.user},function(err,data){
                if(err) return next(err);
                res.redirect('/maintainUser'+data[0]._id);
            });
        }else{
            res.redirect('/loggedUser'+req._passport.session.user+'-'+sn);
        }
});




app.post('/loginLocal',api.loginLocal);
app.post('/getUserfacebook',api.getUserWithFacebook);
app.post('/getUservk',api.getUserWithVk);
app.post('/getUsergoogle',api.getUserWithGoogle);
app.post('/getUserlocal',api.getUserWithLocal);
//End of oAuth

//Deal with events
app.get('/getEventsStart/:userId',api.getEventsStart);
app.get('/getMyEvents/:userId',api.getMyEvents);
app.get('/deleteEvent/:userId/:title',api.deleteMyEvent);
app.post('/createEvent',api.createEvent);
app.get('/deletePicEvent/:userId/:title/:picture',api.deletePicEvent);
app.get('/deleteVideoEvent/:userId/:title/:video',api.deleteVideoEvent);
app.get('/deleteAudioEvent/:userId/:title/:audio',api.deleteAudioEvent);
app.get('/addMeToEvent/:userId/:eventTitle',api.addMeToEvent);


app.get('/deleteMeFromEvent/:userId/:eventId',api.deleteMeFromEvent);
app.get('/infoEvent/:eventId',api.infoEvent);
app.get('/searchEvents/:location',api.searchEvents);
app.get('/getAddedEvents/:userId',api.getAddedEvents);
//End of events


//Edit changes
app.get('/makeChanges/:title/:id',api.makeChanges);
app.get('/getChanges',api.getChanges);
app.get('/infoEventChanges/:eventId/:userId',api.infoEventChanges);
//End of editing changes




//Stuff with angular
app.get('*',function(req, res) {
    res.sendfile('index.html');
});
//End of angular




//handlers
function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
}
function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.status(500);
        res.render('error');
    } else {
        next(err);
    }
}
function errorHandler(err, req, res, next) {
    res.status(500);
    res.render('error', { error: err });
}

http.listen(8080,'104.236.220.176',function(){
    console.log('listen on 8080');
});