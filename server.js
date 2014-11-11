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
var auth = require('./api/auth.js');
var pass = require('./api/passport.js');
var routes = require('./api/routes.js');


var options = {
    key: fs.readFileSync('./private-key.pem'),
    cert: fs.readFileSync('./public-cert.pem')
};
var https = require('https').Server(options,app);




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.use(favicon(path.join(__dirname, 'public/img/mini_logo.ico')));
app.use(logger('dev'));
app.use(express.bodyParser());
app.use(cookieParser());
app.use(cookieParser());
app.use(session({
    secret: 'MEANdevelopment'
}));
app.use(express.static(path.join(__dirname, 'public')));
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
//app.get('/users', api.auth, user.list); If user loged in he is able to see this
app.get('/loggedin', function(req, res) {
    res.send(req.isAuthenticated() ? req.user : '0');
}); // route to log in
app.post('/login', passport.authenticate('local'), function(req, res) {
    res.send(req.user);
}); // route to log out
app.post('/logout', function(req, res){
    req.logOut();
    res.send(200);
})
//auth
app.get('*',function(req, res) {
    res.sendfile('index.html');
});




http.listen(80, function(){
    console.log('listening on 80');
});

https.listen(443,function(){
    console.log('listening on 443');
})


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


