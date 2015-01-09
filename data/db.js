var mongoose = require('mongoose');
var mongoPath = 'mongodb://localhost/test';
var standardOpt = { server: { poolSize: 10 },user:'vladimir050486',pass:'sveta230583'};

/*create users for collections (user, post, event) for everyone with first level password
first level user: vladimir050486
first level pass: sveta230583*/
mongoose.connect(mongoPath,standardOpt);
/*exports.connect = function(){
    mongoose.connect(mongoPath,standardOpt);
}

exports.disconnect = function(){
    mongoose.connection.close();
}*/

var usersDB = new mongoose.Schema({
    name: String,
    password: String,
    gender:String,
    facebookId: {type: String, unique: true, sparse: true },
    vkId: {type: String, unique: true, sparse: true },
    twitterId: {type: String, unique: true, sparse: true },
    googleId: {type: String, unique: true, sparse: true },
    second_name: String,
    date_ofBirth: Date,
    place_ofBirth: String,
    languages_able: [],
    banned: Boolean,
    date_ofRegister: {type: Date, default: Date.now},
    email: {type: String, unique: true, sparse: true },
    about: {type:String},
    skype: String,
    phone: String,
    ava: String,
    rating: Number,
    facebook: String,
    vk: String,
    twitter: String,
    google: String,
    destination:String,
//After register
    type_arrival: String,//(club, guide, traveller, citizen ...)
    type_company: [],//[familly guy, alone, team ...]
    friends: [],
    photos: [],//{name: who took, photo: url}
    videos: [],//{name: who took, video: url}
    changesFound:[],
    complaints: []//{name: who created, msg: body}
})

//Delete one document if time is come
/*userDB.index({ date_ofRegister: 1 }, { expireAfterSeconds : 5 });*/

exports.userDBModel = mongoose.model('user',usersDB);

var msgsDB = new mongoose.Schema({
    date: {type: Date, default: Date.now},
    fromId: String,
    fromName:String,
    toId: String,
    toName: String,
    read: String,
    msg:String,
    photos: [],//{name: who took, photo: url}
    videos: []//{name: who took, video: url}
})
msgsDB.index({ date: 1 }, { expireAfterSeconds : 60*60*24*30 });
exports.msgsDBModel = mongoose.model('msg',msgsDB);

var eventsDB = new mongoose.Schema({
    title: String,
    banned: Boolean,
    date_created: {type: Date, default: Date.now},
    date_exec: Date,
    about: String,
    owner: String,//[who created this event id]
    party: [],//[who have entered this event]
    photos: [],//{name: who took, photo: url}
    videos: [],//{name: who took, video: url}
//    complaints: [],//{name: who created, msg: body}
//    comments: [],//{name: who commented, msg: body, date: when was created}
    destination: String,//Destination of event for search engine
    addressInCity: String,
    phone: String,
    coords:[]//Coordinates of event
})
//Every event exists in DB for a year not longer
eventsDB.index({ date_exec: 1 }, { expireAfterSeconds : 10 });

exports.eventsDBModel = mongoose.model('event',eventsDB);

var changesDB = new mongoose.Schema({
    eventId: String,
    date: Date
})
//Every event exists in DB for a year not longer
changesDB.index({ title: 1 }, { expireAfterSeconds : 60*60*24*30 });

exports.changesDBModel = mongoose.model('change',changesDB);

var postsDB = new mongoose.Schema({
    title: String,
    banned: Boolean,
    date_created: {type: Date, default: Date.now},
    date_exec: Date,
    rating: Number,
    about: String,
    team:[],//[who created this event]
    posted_by:String,//[who posted this event]
    party:[],//[who've joined this event]
    comments: [],//{name: who commented, msg: body, date: when was created},
    photos: [],//{name: who took, photo: url}
    videos: [],//{name: who took, video: url}
    complaints: []//{name: who created, msg: body}
})

//Every post exists in DB for a 5 year not longer
postsDB.index({ date_created: 1 }, { expireAfterSeconds : 60*60*24*365*5 });

exports.postsDBModel = mongoose.model('post',postsDB);

var middlersDB = new mongoose.Schema({
    title: String,
    banned: Boolean,
    date_created: {type: Date, default: Date.now},
    date_exec: Date,
    rating: Number,
    about: String,
    team:[],//[who created this event]
    posted_by:String,//[who posted this event]
    party:[],//[who've joined this event]
    comments: [],//{name: who commented, msg: body, date: when was created},
    photos: [],//{name: who took, photo: url}
    videos: [],//{name: who took, video: url}
    complaints: []//{name: who created, msg: body}
})

//Every middler exists in DB for a year not longer
middlersDB.index({ date_created: 1 }, { expireAfterSeconds : 60*60*24*365 });

exports.middlersDBModel = mongoose.model('middler',middlersDB);









/*var emailDB = mongoose.Schema({
    email: String,
    pwd: String
})

var emailDBModel = mongoose.model('email',emailDB);


exports.getFromDB = function(req,res,next){
    var options = {
        user:'single',
        pass:'single'
    }

        mongoose.connect('mongodb://localhost/test',options);
        emailDBModel.find({},function(err,data){
            if(err) console.log(err);
            //console.log(data);
            res.send(200,data);
            mongoose.connection.close();
        });
}*/


/*exports.saveToDB = function(email,pwd,user){
    var options = {
        user:user,
        pass:pwd
    }

    mongoose.connect('mongodb://localhost/test',options);

   *//* var newUser = new emailDBModel({ email: email, pwd:pwd });

    newUser.save(function(err,newUser){
        if(err) console.log(err);
        console.log(newUser + 'been saved!');
        mongoose.connection.close()
    });*//*

    emailDBModel.create({email:email,pwd:pwd},function(err){
        if(err) console.log(err);
        mongoose.connection.close()
    });

}*/



/*exports.saveToUserAva = function(user,fileName,next){
    mongoose.connect(mongoPath,standardOpt);
    userDBModel.update({name:user},{ava:fileName},{upsert:true},function(err){
        if(err) return next(err);
        mongoose.connection.close();
        return 'saved data to DB';
    });
}

exports.searchForUserId = function(user,next){
    mongoose.connect(mongoPath,standardOpt);
    userDBModel.find({name:user},{_id:1},function(err,data){
        if(err) return next(err);
        mongoose.connection.close();
        return data;
    });
}





exports.removeAvaUser = function(user,file,res,next){
    mongoose.connect(mongoPath,standardOpt);
    userDBModel.update({name:user},{$unset: { ava: 1 }},function(err){
        if(err) return next(err);
        res.send(200);
        mongoose.connection.close();
    });
}*/

///exports.qtyCheck = function
/*
exports.saveToUserDoc = function(name,res){
    var name = name;
    console.log(name);
   // var date = new Date();
    var options = {user:'vladimir050486',pass:'sveta230583'};
    mongoose.connect('mongodb://localhost/test',options);
    userDBModel.update({name:name},{date_ofRegister:new Date},{upsert:true},function(err){
        if(err) return next(err);
        //console.log(name);
        res.send(200);
        mongoose.connection.close();
    });
}*/
