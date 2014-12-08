'use strict';



app.controller('total',function($scope,$resource,$window){
    $scope.test = 'Kuku';
    $scope.logout = function(){
        sessionStorage.userId = undefined;
        $window.location.href = '/';
    }
});





app.controller('home',function($scope,$resource,$window,$document, $location, $anchorScroll){
    $scope.authFace = function(url){
        $window.location.href = url;
    }

    $('#carousel_1').carousel({
        interval: 5000
    })
    $scope.registerUser = function(){
        $window.location.href = 'registerUser';
    }
    $scope.scrollTo = function(id) {
        $location.hash(id);
        $anchorScroll();
        $location.hash('');
    }
    $scope.login = function(){
        if(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test($scope.email)){
            var address = $resource('/loginLocal');
            var query = new address();
            query.email = $scope.email;
            query.pwd = $scope.pwd;
            query.$save(function(data){
                if(data._id){
                    sessionStorage.userId = data._id;
                    $window.location.href='/logged'+data._id+'-local';
                }else{
                    $window.location.href = '/';
                }
            });
        }else{
            $window.location.href = '/';
        }
    }
});

app.controller('registerUser',function($scope,$resource,$compile,$upload,$window,$location,$anchorScroll){
    $('#carousel_reg').carousel({
        interval: 5000
    })
    $scope.scrollTo = function(id) {
        $location.hash(id);
        $anchorScroll();
        $location.hash('');
    }
    //necessary
    $( "#datepicker1" ).datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: 'dd/mm/yy',
        yearRange: "1920:2014",
        onClose:function(){
            $scope.checkDateFormat();
        }
    });
    $( "#datepicker2" ).datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: 'dd/mm/yy',
        yearRange: "1920:2014",
        onClose:function(){
            $scope.checkDateFormat();
        }
    });

    $scope.dateOfBirthPlaceholder = 'Enter date of birth format 00/00/0000 (day/month/year)';
    $scope.emailPlaceholder = 'Enter here your email address!';
    $scope.namePlaceholder = 'Your name goes here!';
    $scope.secondNamePlaceholder = 'Your second name goes here!';
    $scope.placeOfBirthPlaceholder = 'Enter country and city or town!';
    $scope.languagesPlaceholder = 'Languages goes here!';
    $scope.advance = 'false';

    $scope.checkTotal = function(){
        $scope.checkLanguagesInput();
        $scope.checkPlaceOfBirthInput();
        $scope.checkNameInput();
        $scope.checkSecondNameInput();
        $scope.checkEmailFormat();
        $scope.checkPwd();
    }

    $scope.checkLanguagesInput = function(){
        if($scope.selectedLanguages.length==0){
            $scope.selectedLanguagesError = true;
            $scope.languagesPlaceholder = 'This field is necessary';
        }else{
            $scope.selectedLanguagesError = false;
        }
    }

    $scope.checkPwd = function(){
        if(!$scope.passwordR){
            $scope.resPwd = 'Type in your new password!!!';
            $scope.pwdError = true;
        }else{
            $scope.confirmPassword();
        }
    }

    $scope.confirmPassword = function(){
        if($scope.password!=$scope.passwordR){
            $scope.pwdError = true;
            $scope.resPwd = 'You have entered wrong confirmation password!';
        }else{
            $scope.resPwd = 'Confirmation is done!';
        }
    }

    $scope.focusPassword = function(){
        $scope.resPwd = undefined;
        $scope.passwordR = undefined;
        $scope.pwdError = undefined;
    }

    $scope.checkPlaceOfBirthInput = function(){
        if($scope.placeOfBirth===undefined || $scope.placeOfBirth==''){
            $scope.placeOfBirthInputError = true;
            $scope.placeOfBirthPlaceholder = 'This field is necessary!!!';
        }else{
            $scope.placeOfBirthInputError = false;
        }
    }

    $scope.refreshPlaceOfBirth = function(){
        $scope.placeOfBirth = undefined;
        $scope.placeOfBirthInputError = false;
    }

    $scope.checkNameInput = function(){
        if($scope.name===undefined || $scope.name==''){
            $scope.nameInputError = true;
            $scope.namePlaceholder = 'This field is necessary!!!';
        }else{
            $scope.nameInputError = false;
        }
    }

    $scope.refreshFirstName = function(){
        $scope.name = undefined;
        $scope.nameInputError = false;
    }

    $scope.checkSecondNameInput = function(){
        if($scope.secondName===undefined || $scope.secondName==''){
            $scope.secondNameInputError = true;
            $scope.secondNamePlaceholder = 'This field is necessary!!!';
        }else{
            $scope.secondNameInputError = false;
        }
    }

    $scope.refreshLastName = function(){
        $scope.secondName = undefined;
        $scope.secondNameInputError = false;
    }

    $scope.checkDateFormat = function(){
        if($scope.dateOfBirth===undefined || $scope.dateOfBirth==''){
            $scope.dateError = true;
            $scope.dateOfBirthPlaceholder = 'Date of birth must be filled!';
        }else if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test($scope.dateOfBirth)){
            $scope.dateOfBirth = '';
            $scope.dateError = true;
            $scope.dateOfBirthPlaceholder = 'Wrong format of data! Format is 00/00/0000';
        }else{
            $scope.dateError = false;
        }
    }

    $scope.refreshDateOfBirth = function(){
        $scope.dateOfBirth = undefined;
        $scope.dateError = false;
    }

    $scope.checkEmailFormat = function(){
        if($scope.email===undefined || $scope.email==''){
            $scope.emailError = true;
            $scope.emailPlaceholder = 'Register an email address!';
        }else if(!/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test($scope.email)){
            $scope.email = '';
            $scope.emailError = true;
            $scope.emailPlaceholder = 'Wrong email format!';
        }else{
            $scope.emailError = false;
            var address = $resource('/checkEmailExist/'+$scope.email);
            var toDo = address.query(function(){
                if(toDo.length!=0){
                    $scope.email = '';
                    $scope.emailError = true;
                    $scope.emailPlaceholder =toDo[0].email +' - This email address is busy!';
                }
            });
        }
    }

    $scope.refreshEmail = function(){
        $scope.email = undefined;
        $scope.emailError = false;
    }



    $scope.selectedLanguages = [];

                $scope.languages = [
                    "Mandarin",
                    "Spanish",
                    "English",
                    "Hindi",
                    "Arabic",
                    "Portuguese",
                    "Bengali",
                    "Russian",
                    "Japanes",
                    "Punjabi",
                    "German",
                    "Javanese",
                    "Wu",
                    "Malay/Indonesian",
                    "Telugu",
                    "Vietnamese",
                    "Korean",
                    "French",
                    "Marathi",
                    "Tamil",
                    "Urdu",
                    "Turkish",
                    "Italian",
                    "Cantonese",
                    "Persian",
                    "Thai",
                    "Gujarati",
                    "Jin",
                    "Min Nan",
                    "Polish",
                    "Pashto",
                    "Kannada",
                    "Xiang",
                    "Malayalam",
                    "Sundanese",
                    "Hausa",
                    "Nigeria",
                    "Oriya",
                    "Burmese",
                    "Hakka",
                    "Ukrainian",
                    "Bhojpuri",
                    "Tagalog",
                    "Yoruba",
                    "Maithili",
                    "Swahili",
                    "Uzbek",
                    "Sindhi",
                    "Amharic",
                    "Fula",
                    "Romanian",
                    "Oromo",
                    "Igbo",
                    "Azerbaijani",
                    "Awadhi",
                    "Gan",
                    "Cebuano",
                    "Dutch",
                    "Kurdish",
                    "Lao",
                    "Serbo-Croatian",
                    "Malagasy",
                    "Saraiki",
                    "Nepali",
                    "Sinhalese",
                    "Chittagonian",
                    "Zhuang",
                    "Khmer",
                    "Assamese",
                    "Madurese",
                    "Somali",
                    "Marwari",
                    "Magahi",
                    "Haryanvi",
                    "Hungarian",
                    "Chhattisgarhi",
                    "Greek",
                    "Chewa",
                    "Deccan",
                    "Akan",
                    "Kazakh",
                    "Min Bei",
                    "Zulu",
                    "Czech",
                    "Kinyarwanda",
                    "Dhundhari",
                    "Haitian Creole",
                    "Min Dong",
                    "Ilokano",
                    "Quechua",
                    "Kirundi",
                    "Swedish",
                    "Hmong",
                    "Shona",
                    "Uyghur",
                    "Hiligaynon",
                    "Mossi",
                    "Xhosa",
                    "Belarusian",
                    "Balochi"
                ];



    $scope.$on('inputLanguage',function(){
        $scope.selectedLanguages.push($scope.selectedLanguage);
        $scope.selectedLanguage = '';
    })
    $scope.$on('clearInputLanguage',function(){
        $scope.selectedLanguage = '';
    });

    $scope.deleteLanguage = function(lang){
        var ind = $scope.selectedLanguages.indexOf(lang);
        $scope.selectedLanguages.splice(ind,1);
    }

    //Working with ava photo
    var files;
    $scope.onFileSelect = function($files){
        files = $files;
        $scope.ava;
        if($scope.name){
            files.forEach(function(item){
                $scope.upload = $upload.upload({
                    url: '/setAva/user',
                    data: {user: $scope.name},
                    file: item
                }).progress(function(evt) {
                        var progress = parseInt(100.0 * evt.loaded / evt.total);
                        $scope.progress = progress;

                    }).success(function(data, status, headers, config) {
                        $scope.ava = data;

                    });
            });
        }else{
            $(".alert").alert();
            $window.scrollTo('#exampleInputName',{duration:'slow'});
            $scope.nameInputError = true;
            $scope.namePlaceholder = 'This field is necessary!!!';
            files = undefined;
        }
    };


    $scope.deleteAva = function(file){
        var Todo = $resource('/deleteAva/'+$scope.ava);
        var info = Todo.query();
        $scope.ava = undefined;
    }





    $scope.submit = function(){
        $scope.checkTotal();
        if($scope.nameInputError || $scope.secondNameInputError || $scope.dateError || $scope.placeOfBirthInputError || $scope.selectedLanguagesError || $scope.emailError || !$scope.name || !$scope.passwordR || !$scope.secondName || !$scope.dateOfBirth || !$scope.placeOfBirth || $scope.selectedLanguages.length==0 || !$scope.email){
        }else{
            var address = $resource('/saveUserData');
            var querySchema = new address();
            querySchema.name = $scope.name;
            querySchema.gender = $scope.gender;
            querySchema.passwordR = $scope.passwordR;
            querySchema.secondName = $scope.secondName;
            querySchema.dateOfBirth = $scope.dateOfBirth;
            querySchema.placeOfBirth = $scope.placeOfBirth;
            querySchema.selectedLanguages = $scope.selectedLanguages;
            querySchema.email = $scope.email;
            querySchema.about = $scope.about;
            querySchema.phone = $scope.phone;
            querySchema.skype = $scope.skype;
            querySchema.facebookId = $scope.facebookId;
            querySchema.facebookLink = $scope.facebookLink;
            querySchema.vkId = $scope.vkId;
            querySchema.vkLink = $scope.vkLink;
            querySchema.twitterId = $scope.twitterId;
            querySchema.twitterLink = $scope.twitterLink;
            querySchema.ava = $scope.ava;
            querySchema.$save(function(data){
                sessionStorage.userId = data._id;
                $window.location.href='/succes'+data._id+'-'+'local';
            });
        }
    }
});


app.controller('maintainUser',function($scope,$routeParams,$resource,$upload,$window,$route){
    if(sessionStorage.userId != $routeParams.user){
        $window.location.href = '/loginUser'
    }

    $( ".datepicker" ).datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: 'dd/mm/yy',
        yearRange: "1920:2014",
        onClose:function(){
            $scope.checkDateFormat();
        }
    });

    $scope.checkDateFormat = function(){
        if($scope.personDateOfBirth===undefined || $scope.personDateOfBirth==''){
            $scope.dateError = true;
            $scope.dateOfBirthPlaceholder = 'Date of birth must be filled!';
        }else if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test($scope.personDateOfBirth)){
            $scope.dateOfBirth = '';
            $scope.dateError = true;
            $scope.dateOfBirthPlaceholder = 'Wrong format of data! Format is 00/00/0000';
        }else{
            $scope.dateError = false;
        }
    }

    $scope.userId = $routeParams.user;
    var address = $resource('/getUserInfo');
    var query = new address();
    query.userId = $scope.userId;
    query.$save(function(data){
        $scope.info = data;
        $scope.email = data.email;
        $scope.emailPlaceholder = data.email;
        $scope.selectedLanguages = data.languages_able;
        $scope.about = data.about;
        $scope.currentPicFolder = 'pictures';
        $scope.currentVideoFolder = 'videos';
        $scope.gender = $scope.info.gender;
        var addr = $resource('/foldersList/'+$scope.info._id);
        var que = addr.query(function(){
            $scope.resFolders = que;
        });
        var addrVideo = $resource('/foldersVideo/'+$scope.info._id);
        var queVideo = addrVideo.query(function(){
            $scope.resFoldersVideo = queVideo;
        });
    });
    $scope.onAvaChange = function($files){
        var files = $files;
        if(sessionStorage.userId==$scope.info._id){
            files.forEach(function(item){
                $scope.upload = $upload.upload({
                    url: '/changeAvaUser',
                    data: {userId: $scope.info._id,
                            oldAva: $scope.info.ava
                    },
                    file: item
                }).progress(function(evt) {
                        var progress = parseInt(100.0 * evt.loaded / evt.total);
                        $scope.progress = progress;

                    }).success(function(data, status, headers, config) {
                        $scope.info.ava = data;
                    });
            });
        }else{
            $window.location.href = '/loginUser';
        }
    };
    $scope.deleteAva = function(){
        if(sessionStorage.userId==$scope.info._id){
            var address = $resource('/deleteAva');
            var query = new address();
            query.userId = $scope.info._id;
            query.ava = $scope.info.ava;
            query.$save(function(){
                $scope.info.ava = undefined;
            });
        }else{
            $window.location.href = '/loginUser';
        }
    }
    $scope.onAvaInsert = function($files){
        var files = $files;
        if(sessionStorage.userId==$scope.info._id){
            files.forEach(function(item){
                $scope.upload = $upload.upload({
                    url: '/insertAvaUser',
                    data: {userId: $scope.info._id
                    },
                    file: item
                }).progress(function(evt) {
                        var progress = parseInt(100.0 * evt.loaded / evt.total);
                        $scope.progress = progress;

                    }).success(function(data, status, headers, config) {
                        $scope.info.ava = data;

                    });
            });
        }else{
            $window.location.href = '/loginUser';
        }
    };
    $scope.languages = [
        "Mandarin",
        "Spanish",
        "English",
        "Hindi",
        "Arabic",
        "Portuguese",
        "Bengali",
        "Russian",
        "Japanes",
        "Punjabi",
        "German",
        "Javanese",
        "Wu",
        "Malay/Indonesian",
        "Telugu",
        "Vietnamese",
        "Korean",
        "French",
        "Marathi",
        "Tamil",
        "Urdu",
        "Turkish",
        "Italian",
        "Cantonese",
        "Persian",
        "Thai",
        "Gujarati",
        "Jin",
        "Min Nan",
        "Polish",
        "Pashto",
        "Kannada",
        "Xiang",
        "Malayalam",
        "Sundanese",
        "Hausa",
        "Nigeria",
        "Oriya",
        "Burmese",
        "Hakka",
        "Ukrainian",
        "Bhojpuri",
        "Tagalog",
        "Yoruba",
        "Maithili",
        "Swahili",
        "Uzbek",
        "Sindhi",
        "Amharic",
        "Fula",
        "Romanian",
        "Oromo",
        "Igbo",
        "Azerbaijani",
        "Awadhi",
        "Gan",
        "Cebuano",
        "Dutch",
        "Kurdish",
        "Lao",
        "Serbo-Croatian",
        "Malagasy",
        "Saraiki",
        "Nepali",
        "Sinhalese",
        "Chittagonian",
        "Zhuang",
        "Khmer",
        "Assamese",
        "Madurese",
        "Somali",
        "Marwari",
        "Magahi",
        "Haryanvi",
        "Hungarian",
        "Chhattisgarhi",
        "Greek",
        "Chewa",
        "Deccan",
        "Akan",
        "Kazakh",
        "Min Bei",
        "Zulu",
        "Czech",
        "Kinyarwanda",
        "Dhundhari",
        "Haitian Creole",
        "Min Dong",
        "Ilokano",
        "Quechua",
        "Kirundi",
        "Swedish",
        "Hmong",
        "Shona",
        "Uyghur",
        "Hiligaynon",
        "Mossi",
        "Xhosa",
        "Belarusian",
        "Balochi"
    ];
    $scope.$on('inputLanguage',function(){
        $scope.selectedLanguages.push($scope.selectedLanguage);
        $scope.selectedLanguage = '';
    })
    $scope.$on('clearInputLanguage',function(){
        $scope.selectedLanguage = '';
    });
    $scope.deleteLanguage = function(lang){
        var ind = $scope.selectedLanguages.indexOf(lang);
        $scope.selectedLanguages.splice(ind,1);
    }
    $scope.checkLanguagesInput = function(){
        if($scope.selectedLanguages.length==0){
            $scope.selectedLanguagesError = true;
            $scope.languagesPlaceholder = 'This field is necessary';
        }else{
            $scope.selectedLanguagesError = false;
        }
    }
    $scope.checkEmailFormat = function(){
       if(!/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test($scope.email)){
            $scope.email = '';
            $scope.emailError = true;
            $scope.emailPlaceholder = 'Wrong email format!';
        }else{
            $scope.emailError = false;
            var address = $resource('/checkEmailExist/'+$scope.email);
            var toDo = address.query(function(){
                if(toDo.length!=0 && toDo[0]._id!=sessionStorage.userId){
                    $scope.email = '';
                    $scope.emailError = true;
                    $scope.emailPlaceholder =toDo[0].email +' - This email address is busy!';
                }
            });
        }
    }

    $scope.onPicSelect = function($files){
        var files = $files;
        if(sessionStorage.userId==$scope.info._id){
            files.forEach(function(item){
                $scope.upload = $upload.upload({
                    url: '/insertPicturesUser',
                    data: {userId: $scope.info._id,
                            folder: $scope.currentPicFolder
                    },
                    file: item
                }).progress(function(evt) {
                        var progress = parseInt(100.0 * evt.loaded / evt.total);
                        $scope.progress = progress;

                    }).success(function(data, status, headers, config) {
                        //make result visible
                        var addr = $resource('/foldersList/'+$scope.info._id);
                        var que = addr.query(function(){
                            $scope.resFolders = que;
                        });
                    });
            });
        }else{
            $window.location.href = '/loginUser';
        }
    };

    $scope.selectFolder = function(folder){
        $scope.currentPicFolder = folder;
        var addr = $resource('/picsInFolder/'+$scope.info._id+'/'+folder);
        var que = addr.query(function(){
            $scope.folderPics = que;
        });
    };

    $scope.closeFolder = function(){
        $scope.folderPics = undefined;
    }

    $scope.deletePic = function(pic,folder){
        var addr = $resource('/deletePic/'+$scope.info._id+'/'+folder+'/'+pic);
        var que = addr.query();

        var num = $scope.folderPics[0].photos.indexOf(pic);
        $scope.folderPics[0].photos.splice(num,1);
    }







    $scope.onVideoSelect = function($files){
        var files = $files;
        if(sessionStorage.userId==$scope.info._id){
            files.forEach(function(item){
                $scope.upload = $upload.upload({
                    url: '/insertVideosUser',
                    data: {userId: $scope.info._id,
                        folder: $scope.currentVideoFolder
                    },
                    file: item
                }).progress(function(evt) {
                        var progress = parseInt(100.0 * evt.loaded / evt.total);
                        $scope.progress = progress;

                    }).success(function(data, status, headers, config) {
                        //make result visible
                        var addr = $resource('/foldersVideo/'+$scope.info._id);
                        var que = addr.query(function(){
                            $scope.resFoldersVideo = que;
                        });
                    });
            });
        }else{
            $window.location.href = '/loginUser';
        }
    };

    $scope.closeFolderVideo = function(){
        $scope.folderVideos = undefined;
    }

    $scope.selectFolderVideo = function(folder){
        $scope.currentVideoFolder = folder;
        var addr = $resource('/videosInFolder/'+$scope.info._id+'/'+folder);
        var que = addr.query(function(){
            $scope.folderVideos = que;
        });
    };

    $scope.deletedVideos = [];
    $scope.deleteVideo = function(video,folder){
        var addr = $resource('/deleteVideo/'+$scope.info._id+'/'+folder+'/'+video);
        var que = addr.query(function(){
            $scope.deletedVideos.push(video);
        });
    }
    $scope.deleteVideo = function(video,folder){
        var addr = $resource('/deleteVideo/'+$scope.info._id+'/'+folder+'/'+video);
        var que = addr.query();

        var num = $scope.folderVideos[0].videos.indexOf(video);
        $scope.folderVideos[0].videos.splice(num,1);
    }
    $scope.deleteFilterLanguage = function(lang){
        var ind = $scope.filteredLanguages.indexOf(lang);
        $scope.filteredLanguages.splice(ind,1);
    }
    $scope.filteredLanguages = [];
    $scope.$on('inputFilterLanguage',function(){
        $scope.filteredLanguages.push($scope.filteredLanguage);
        $scope.filteredLanguage = '';
    })
    $scope.$on('clearFilterLanguage',function(){
        $scope.filteredLanguage = '';
    });

    $scope.searchPerson = function(){
        var addr = $resource('/searchPerson');
        var que = new addr();
        que.name = $scope.personName;
        que.secondName = $scope.personSecondName;
        que.place = $scope.personPlaceOfBirth;
        que.date = $scope.personDateOfBirth;
        que.ageFrom = $scope.ageFrom;
        que.ageTill = $scope.ageTill;
        que.destination = $scope.destinationFilter;
        que.gender = $scope.genderFilter;
        que.languages = $scope.filteredLanguages;
        que.$save(function(data){
            $scope.resPersons = data;
        });
    }

    $scope.addToFriends = function(id){
        $scope.info.friends.push(id);
        var addr = $resource('/addToFriends');
        var que = new addr();
        que.id = id;
        que.myId = $scope.info._id;
        que.$save(function(){
        });
    }

    $scope.deleteFromFriends = function(id){
        var it = $scope.info.friends.indexOf(id);
        $scope.info.friends.splice(it,1);
        var addr = $resource('/deleteFromFriends');
        var que = new addr();
        que.id = id;
        que.myId = $scope.info._id;
        que.$save(function(){
        });
    }

    $scope.submit = function(){
        var addr = $resource('/makeChangesUser');
        var que = new addr();
        que.id = $scope.info._id;
        que.email = $scope.email;
        que.skype = $scope.skype;
        que.phone = $scope.phone;
        que.languages = $scope.selectedLanguages;
        que.about = $scope.about;
        que.destination = $scope.destination;
        que.gender = $scope.gender;
        que.$save(function(){
            $route.reload();
        });
    }
});

app.controller('createEvent',function($scope,$resource,$upload,$window){
    if(sessionStorage.userId){
        $scope.resultPics = [];
        $scope.resultVids = [];
        $scope.userId = sessionStorage.userId;
        $( ".datepicker" ).datepicker({
            changeMonth: true,
            changeYear: true,
            dateFormat: 'dd/mm/yy',
            yearRange: "1920:2014",
            onClose:function(){
                $scope.checkDateFormat();
            }
        });
        $scope.onPicSelect = function($files){
            var miss = $scope.resultPics.indexOf('wrong format');
            if(miss!='-1') $scope.resultPics.splice(miss,1);
            var files = $files;
                files.forEach(function(item){
                    $scope.upload = $upload.upload({
                        url: '/insertPicturesEvent',
                        data: {userId: sessionStorage.userId,
                            eventTitle: $scope.title
                        },
                        file: item
                    }).progress(function(evt) {
                            var progress = parseInt(100.0 * evt.loaded / evt.total);
                            $scope.progress = progress;

                        }).success(function(data, status, headers, config) {
                            $scope.resultPics.push(data);
                        });
                });
        };
        $scope.deletePic = function(pic){
                var adr = $resource('/deletePicEvent');
                var que = new adr();
                que.userId = sessionStorage.userId;
                que.picture = pic;
                que.title = $scope.title;
                que.$save(function(){
                    var oop = $scope.resultPics.indexOf(pic);
                    $scope.resultPics.splice(oop,1);
                });
        }
        $scope.onVideoSelect = function($files){
            var miss = $scope.resultVids.indexOf('wrong format');
            if(miss!='-1') $scope.resultVids.splice(miss,1);
            var files = $files;
            files.forEach(function(item){
                $scope.upload = $upload.upload({
                    url: '/insertVideosEvent',
                    data: {userId: sessionStorage.userId,
                        eventTitle: $scope.title
                    },
                    file: item
                }).progress(function(evt) {
                        var progress = parseInt(100.0 * evt.loaded / evt.total);
                        $scope.progress = progress;

                    }).success(function(data, status, headers, config) {
                        $scope.resultVids.push(data);
                    });
            });
        };



    }else{
        $window.location.href='/login';
    }
});

/*app.controller('manageEvent',function($scope){

});*/

/*app.controller('loginUser',function($scope,$resource,$window){
    $scope.enter = function(){
        if(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test($scope.email)){
            var address = $resource('/loginUser:443');
            var query = new address();
            query.email = $scope.email;
            query.pwd = $scope.pwd;
            query.$save(function(data){
                if(data._id){
                    sessionStorage.userId = data._id;
                    $window.location.href='/maintainUser'+data._id;
                }else{
                    $window.location.href = '/loginUser';
                }
            });
        }else{
            $window.location.href = '/';
        }
    }
});*/



/*
app.controller('loggedHome',function($scope,$routeParams,$resource){

    $('#carousel_1').carousel({
        interval: 5000
    })
    $scope.scrollTo = function(id) {
        $location.hash(id);
        $anchorScroll();
        $location.hash('');
    }
    $scope.logout = function(){

    }
})*/








app.controller('logged',function($scope,$routeParams,$resource,$window){
    var net = $routeParams.sn;
    net = net.split('-');
    $scope.idSoc = net[0];
    $scope.net = net[1];
    var adr = $resource('/getUser'+$scope.net);
    var que = new adr();
    que.id = $scope.idSoc;
    que.$save(function(data){
        $scope.data = data;
        sessionStorage.userId = data.res[0]._id;
    });
});
