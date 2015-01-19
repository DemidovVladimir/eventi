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
// end of configuring passport






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
    secret: 'MEANdevelopment'
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);


var connected = [];

io.on('connection',function(socket){
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
            io.to(msg.userToId).emit('message',answer);
            io.to(user).emit('message',answer);
        });


        socket.on('disconnect', function(){
            var intAr = connected.indexOf(user);
            connected.splice(intAr,1);
            socket.leave(user);
        });


    });

//    socket.on('disconnect me',function(user){
//
//    });

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
app.get('/auth/vkontakte',
    passport.authenticate('vkontakte', { scope: 'read_stream' })
);
app.get('/auth/vkontakte/callback',
    passport.authenticate('vkontakte', { successRedirect: '/success/vk',
        failureRedirect: '/loginUser' }));




//Google
app.get('/auth/google',
    passport.authenticate('google', { scope:
            'https://www.googleapis.com/auth/plus.login'}
    ));
app.get( '/auth/google/callback',
    passport.authenticate( 'google', { successRedirect: '/success/google',
        failureRedirect: '/loginUser' }));





app.get('/success/:sn',function(req,res,next){
    var sn = req.param('sn');
    res.redirect('/loggedUser'+req._passport.session.user+'-'+sn);
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
app.post('/insertVideosEvent',api.insertVideosEvent);
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










http.listen(8080, 'localhost',function(){
    console.log('listening on 80');
});









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