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
/*var https = require('https');*/


/*var options = {
    key: fs.readFileSync('enveti.key'),
    cert: fs.readFileSync('./key/461b1981d955e.crt'),
    ca:     fs.readFileSync('./key/gd_bundle-g2-g1.crt'),
    requestCert:        true,
    rejectUnauthorized: false
};*/











//Config https server
/*var sslOptions = {
    key: fs.readFileSync(__dirname + '/ssl-key.pem'),
    cert: fs.readFileSync(__dirname + '/ssl-cert.pem')
};
var https = require('https').createServer(sslOptions,app);*/
//End of https



















//Config https server
/*var sslOptions = {
    key: fs.readFileSync(__dirname + '/ssl-key.pem'),
    cert: fs.readFileSync(__dirname + '/ssl-cert.pem')
};
var https = require('https').createServer(sslOptions,app);*/
//End of https









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




//Manipulation with stuff
app.post('/setAva/user',api.setAvaToUser);
app.post('/saveUserData', api.saveUserData);
app.post('/getUserInfo',api.getUserInfo);
app.post('/changeAvaUser',api.changeAvaUser);
app.post('/insertAvaUser',api.insertAvaUser);
app.post('/loginUser:443',api.loginUser);
app.post('/insertPicturesUser',api.insertPicturesUser);
app.get('/deleteAva/:file',api.deleteAvaFromUser);
app.get('/checkEmailExist/:email',api.checkEmailExist);
app.post('/deleteAva',api.deleteAva);
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
app.post('/insertPicturesEvent',api.insertPicturesEvent);
app.post('/deletePicEvent',api.deletePicEvent);
app.post('/insertVideosEvent',api.insertVideosEvent);
//End of manipulations






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
    res.redirect('/succes'+req._passport.session.user+'-'+sn);
});
app.post('/loginLocal',api.loginLocal);
app.post('/getUserfacebook',api.getUserWithFacebook);
app.post('/getUservk',api.getUserWithVk);
app.post('/getUsergoogle',api.getUserWithGoogle);
app.post('/getUserlocal',api.getUserWithLocal);
//End of oAuth









//Stuff with angular
app.get('*',function(req, res) {
    res.sendfile('index.html');
});
//End of angular










http.listen(80, 'localhost',function(){
    console.log('listening on 80');
});
/*https.listen(443,function(){
    console.log('listening on 443');
});*/
/*
https.Server(options, app).listen(443,function(){
    console.log('listening on 443');
});
*/









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