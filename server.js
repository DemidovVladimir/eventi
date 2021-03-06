var express = require('express');
var app = express();
var http = require('http').Server(app);
var fs = require('fs');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var api = require('./api/index.js');
var io = require('socket.io')(http);
var db = require('./data/db.js');
var rimraf = require('rimraf');
var async = require('async');
var exec = require('child_process').exec;
var gm = require('gm');
var ffmpeg = require('ffmpeg');
//var util = require('util');
//var mongoose = require('mongoose');
//var db = mongoose.createConnection('mongodb://vladimir050486:sveta230583@104.236.240.106:27017/test').model;



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


//



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(favicon(path.join(__dirname, 'public/img/mini_logo.ico')));
app.use(logger('dev'));
app.use(express.bodyParser());
app.use(cookieParser());
app.use(cookieParser());
app.use(session({
    secret: 'MEANdevelopment',
    resave: true,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);


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
var fileStream = io.of('/fileTransfer');
fileStream.on('connection', function(socket){
    socket.on('Start', function (data) { //data contains the variables that we passed through in the html file
        var Type = data.Type;
        var userId = data.UserId;
        var Name = data['Name'];
        var toType = data.toType;
        var additionalAttrs = data.additionalAttrs;
        var folder;
        var pattVideo = new RegExp("video");
        var pattImage = new RegExp("image");
        var pattMusic = new RegExp("audio");
        var typeVideo;
        var typeImage;
        var typeMusic;
        async.series([
            function(callback){
                if(data.Folder){
                    folder = data.Folder;
                    callback(null, 'folder deal up');
                }else{
                    folder = 'default';
                    callback(null, 'folder deal up');
                }
            },
            function(callback){
                typeVideo = pattVideo.test(Type);
                typeImage = pattImage.test(Type);
                typeMusic = pattMusic.test(Type);
                callback(null, 'apply to variables');
            }
        ],
            function(err, results){
                if(!typeImage && !typeVideo && !typeMusic){
                    fileStream.emit('wrongFormat',{'answer' : 'Try to use proper video, audio or image file type.'});
                }else{
                    async.series([
                        function(callback){
                            if(typeImage){
                                var objFile = {};
                                objFile.title = Name;
                                objFile.folder = folder;
                                if(toType=='user'){
                                    db.userDBModel.update({_id:userId},{$push:{photos:objFile}},{upsert:true},function(err){
                                        if(err) return next(err);
                                        callback(null, 'images');
                                    });
                                }else{
                                    db.eventsDBModel.update({owner:userId,title:additionalAttrs.title},{$push:{photos:objFile}},{upsert:true},function(err){
                                        if(err) return next(err);
                                        callback(null, 'images');
                                    });
                                }
                            }else{
                                callback(null, 'images');
                            }
                        },
                        function(callback){
                            if(typeVideo){
                                var objFile = {};
                                var titleFormat = Name.split('.').pop();
                                var titleName = Name.split(titleFormat)[0];
                                objFile.title = titleName+'mp4';
                                objFile.folder = folder;
                                if(toType=='user'){
                                    db.userDBModel.update({_id:userId},{$push:{videos:objFile}},{upsert:true},function(err){
                                        if(err) return next(err);
                                        callback(null, 'videos');
                                    });
                                }else{
                                    db.eventsDBModel.update({owner:userId,title:additionalAttrs.title},{$push:{videos:objFile}},{upsert:true},function(err){
                                        if(err) return next(err);
                                        callback(null, 'videos');
                                    });
                                }
                            }else{
                                callback(null, 'videos');
                            }
                        },
                        function(callback){
                            if(typeMusic){
                                var objFile = {};
                                objFile.title = Name;
                                objFile.folder = folder;
                                if(toType=='user'){
                                    db.userDBModel.update({_id:userId},{$push:{audio:objFile}},{upsert:true},function(err){
                                        if(err) return next(err);
                                        callback(null, 'audio');
                                    });
                                }else{
                                    db.eventsDBModel.update({owner:userId,title:additionalAttrs.title},{$push:{audio:objFile}},{upsert:true},function(err){
                                        if(err) return next(err);
                                        callback(null, 'audio');
                                    });
                                }
                            }else{
                                callback(null, 'audio');
                            }
                        },
                        function(callback){
                            fs.mkdir('public/uploaded/'+userId+'/'+toType,function(){
                                callback(null, 'mkdir');
                            });
                        },
                        function(callback){
                            fs.mkdir('public/uploaded/'+userId+'/'+toType+'/'+additionalAttrs.title,function(){
                                callback(null, 'mkdir');
                            });
                        }
                    ],
                        function(err, results){
                            Files[Name] = {  //Create a new Entry in The Files Variable
                                FileSize : data['Size'],
                                Data     : "",
                                Downloaded : 0
                            }
                            var Place = 0;
                            try{
                                var Stat = fs.statSync('public/uploaded/'+userId+'/'+toType+'/'+additionalAttrs.title+'/'+Name);
                                if(Stat.isFile())
                                {
                                    Files[Name]['Downloaded'] = Stat.size;
                                    Place = Stat.size / 10487;
                                }
                            }
                            catch(er){} //It's a New File
                            fs.open('public/uploaded/'+userId+'/'+toType+'/'+additionalAttrs.title+'/'+Name, "a", 0755, function(err, fd){
                                if(err)
                                {
                                    console.log(err);
                                }
                                else
                                {
                                    Files[Name]['Handler'] = fd; //We store the file handler so we can write to it later
                                    fileStream.emit('MoreData', { 'Place' : Place, 'Percent' : 1 });
                                }
                            });
                        });
                }
            });
    });
    socket.on('Upload', function (data){
        var Name = data['Name'];
        var userId = data.UserId;
        var Type = data.Type;
        var toType = data.toType;
        var additionalAttrs = data.additionalAttrs;

        var pattVideo = new RegExp("video");
        var pattImage = new RegExp("image");
        var pattMusic = new RegExp("audio");
        var typeVideo = pattVideo.test(Type);
        var typeImage = pattImage.test(Type);
        var typeMusic = pattMusic.test(Type);

        Files[Name]['Downloaded'] += data['Data'].length;
        Files[Name]['Data'] += data['Data'];
        if(Files[Name]['Downloaded'] == Files[Name]['FileSize']) //If File is Fully Uploaded
        {
            fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen){
                async.series([
                    function(callback){
                        if(typeImage){
                            var r = fs.createReadStream('public/uploaded/'+userId+'/'+toType+'/'+additionalAttrs.title+'/'+Name);
                            var w =  fs.createWriteStream('public/uploaded/'+userId+'/'+toType+'/'+additionalAttrs.title+'/mini_'+Name);
                            gm(r).resize(300)
                                .stream(function (err, stdout, stderr) {
                                    stdout.pipe(w);
                                    if(err){
                                        console.log(err);
                                    }else{
                                        callback(null, 'images');
                                    }
                            });
                        }else{
                            callback(null, 'images');
                        }
                    },
                    function(callback){
                        if(typeVideo){
                            var format = Name.split('.').pop();
                            var newTitle = Name.split('.'+format)[0];
                            try {
                                var process = new ffmpeg('public/uploaded/'+userId+'/'+toType+'/'+additionalAttrs.title+'/'+Name);
                                process.then(function(video) {
                                    video
                                        .setVideoFormat('mp4')
                                        .save('public/uploaded/'+userId+'/'+toType+'/'+additionalAttrs.title+'/'+newTitle+'.mp4', function (error, file) {
                                            fs.unlinkSync('public/uploaded/'+userId+'/'+toType+'/'+additionalAttrs.title+'/'+Name);
//Try to change to './'
                                            callback(null, 'videos');
                                        });
                                },function (err) {
                                    console.log(err);
                                });
                            }catch(e){
                                console.log(e);
                            }
                        }else{
                            callback(null, 'videos');
                        }
                    }
                ],
                    function(err, results){
                        fileStream.emit('Done', 'ready');
                    });
            });
        }
        else if(Files[Name]['Data'].length > 10485760){ //If the Data Buffer reaches 10MB
            fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen){
                Files[Name]['Data'] = ""; //Reset The Buffer
                var Place = Files[Name]['Downloaded'] / 10487;
                var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
                fileStream.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
            });
        }
        else
        {
            var Place = Files[Name]['Downloaded'] / 10487;
            var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
            fileStream.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
        }
    });
});





//Msgs
app.get('/getMsgs/:userId',api.getMsgs);
app.get('/getUnsetMsgs/:userId',api.getUnsetMsgs);
//Msgs

//Manipulation with stuff
app.post('/setAva/user',api.setAvaToUser);
app.post('/saveUserData', api.saveUserData);
app.post('/getUserInfo',api.getUserInfo);
app.post('/changeAvaUser',api.changeAvaUser);
app.post('/insertAvaUser',api.insertAvaUser);
app.post('/insertPicturesUser',api.insertPicturesUser);
app.get('/deleteAva/:file',api.deleteAvaFromUser);
app.get('/checkEmailExist/:email',api.checkEmailExist);
app.post('/deleteAva',api.deleteAva);
app.post('/deleteMe',api.deleteMe);




app.get('/foldersList/:userId',api.foldersList);
app.get('/picsInFolder/:userId/:folder',api.picsInFolder);
app.get('/deletePic/:userId/:folder/:picture',api.deletePic);
app.get('/foldersVideo/:userId',api.foldersVideo);
app.post('/insertVideosUser',api.insertVideosUser);
app.get('/videosInFolder/:userId/:folder',api.videosInFolder);
app.get('/deleteVideo/:userId/:folder/:video',api.deleteVideo);
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
app.post('/insertPicturesEvent',api.insertPicturesEvent);
app.post('/deletePicEvent',api.deletePicEvent);
app.post('/deleteVideoEvent',api.deleteVideoEvent);
app.post('/insertVideosEvent',api.insertVideosEvent(io));
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








//app.get('/',function(req,res,next){
//    res.send('KUKU');
//})











//handlers
function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
}
function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.status(500).send({ error: 'Something blew up!' });
    } else {
        next(err);
    }
}
function errorHandler(err, req, res, next) {
    res.status(500);
    res.render('error', { error: err });
}

http.listen(8080, '104.236.220.176',function(){
    console.log('listening on 8080');
});