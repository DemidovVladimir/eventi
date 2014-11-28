var express = require('express');
var app = express();
var http = require('http').Server(app);
var fs = require('fs');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var bodyParser = require('body-parser');
var api = require('./api/index.js');
var passport = require('passport')
    , FacebookStrategy = require('passport-facebook').Strategy
        ,VKontakteStrategy = require('passport-vkontakte').Strategy
            , TwitterStrategy = require('passport-twitter').Strategy;
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
        callbackURL: "http://enveti.com/auth/facebook/callback"
    },
   /* function(accessToken, refreshToken, profile, done) {
        process.nextTick(function () {

            // To keep the example simple, the user's Facebook profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Facebook account with a user record in your database,
            // and return that user instead.
            return done(null, profile);
        });
    }*/
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
        callbackURL:  "http://enveti.com/auth/vkontakte/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        api.pasteUserVkontakte(profile);
        return done(null,profile.id);
    }
));


passport.use(new GoogleStrategy({
        clientID:     '475991763822-q8p9t2p9f143ivrep5878gdvindipc63.apps.googleusercontent.com',
        clientSecret: 'S40fFKxvEMRP71qIzXbrP4rf',
        callbackURL: "http://enveti.com/auth/google/callback",
        passReqToCallback   : true
    },
    function(request, accessToken, refreshToken, profile, done) {
        api.pasteUserGoogle(profile);
        return done(null,profile.id);
    }
));












var options = {
    key: fs.readFileSync('./private-key.pem'),
    cert: fs.readFileSync('./public-cert.pem')
};
var https = require('https').Server(options,app);

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


//Params executor
/*app.param('id', function (req, res, next, id) {
    req.id = id;
    next();
})

app.get('/user/:id', function (req, res, next) {
    console.log(req.id);
    next();
});

app.get('/user/:id', function (req, res) {
    console.log(req.id);
    res.end();
});*/



/*app.get('/getData',api.getData);
app.post('/saveData',api.saveData);*/

/*app.post('/saveToUser',api.saveToUser);*/


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


//testZone
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
//testZoneEnd

//auth
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


//auth

app.get('/success/:sn',function(req,res,next){
    var sn = req.param('sn');
    res.redirect('/succes'+req._passport.session.user+'-'+sn);
});

app.post('/getUserfacebook',api.getUserWithFacebook);
//app.post('/getUserWithVkontakte',api.getUserWithFacebook);

app.get('*',function(req, res) {
    res.sendfile('index.html');
});

app.post('/insertPicturesEvent',api.insertPicturesEvent);
app.post('/deletePicEvent',api.deletePicEvent);
app.post('/insertVideosEvent',api.insertVideosEvent);


http.listen(80, function(){
    console.log('listening on 80');
});

https.listen(443,function(){
    console.log('listening on 443');
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


