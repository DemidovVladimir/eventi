'use strict';



app.controller('total',function($scope,$resource,$window){
    $scope.test = 'Kuku';
    $scope.logout = function(){
        $window.localStorage.clear('session')
        $window.location.href = '/';
    }
});





app.controller('home',function($scope,$resource,$window,$document, $location, $anchorScroll){
    var sess = $window.localStorage.getItem('session');
    if(sess){
        $scope.sessionId = JSON.parse($window.localStorage.getItem('session')).id;
    }else{
        $scope.sessionId = undefined;
    }
    if($scope.sessionId){
        $window.location.href = "/loggedUser"+$scope.sessionId+'-local';
    }else{
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
                        //$window.localStorage.setItem('userId', JSON.stringify(data._id))
                        //$scope.$storage.userId = data._id;
                        $window.location.href = '/loggedUser'+data._id+'-local';
                    }else{
                        $window.location.href = '/';
                    }
                });
            }else{
                $window.location.href = '/';
            }
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

    $scope.dateOfBirthPlaceholder = 'Enter date of birth format 00/00/0000 (day/month/year)';
    $scope.emailPlaceholder = 'Enter here your email address!';
    $scope.namePlaceholder = 'Your name goes here!';
    $scope.secondNamePlaceholder = 'Your second name goes here!';
    $scope.placeOfBirthPlaceholder = 'Enter country and city or town!';
    $scope.languagesPlaceholder = 'Languages goes here!';
    $scope.advance = 'false';


    $scope.checkEmailFormat = function(){
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
        if($scope.name){
            files.forEach(function(item){
                $scope.upload = $upload.upload({
                    url: '/setAva/user',
                    data: {
                        user: $scope.name,
                        email: $scope.email
                    },
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



    $scope.about = '';
    $scope.submit = function(){
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
            /*querySchema.phone = $scope.phone;
            querySchema.skype = $scope.skype;
            querySchema.facebookId = $scope.facebookId;
            querySchema.facebookLink = $scope.facebookLink;
            querySchema.vkId = $scope.vkId;
            querySchema.vkLink = $scope.vkLink;
            querySchema.twitterId = $scope.twitterId;
            querySchema.twitterLink = $scope.twitterLink;*/
            querySchema.ava = $scope.ava;
            querySchema.$save(function(data){
                $scope.test = data;
                var obj = new Object();
                obj.id = data._id;
                obj.name = data.name;
                $window.localStorage.setItem('session', JSON.stringify(obj));
                $window.location.href='/loggedUser'+data._id+'-'+'local';
            });
    }
});








app.controller('maintainUser',function($scope,$routeParams,$resource,$upload,$window,$route,$location,$anchorScroll,$sce){
    $scope.session = JSON.parse($window.localStorage.getItem('session'));
    if(!$scope.session){
        var address = $resource('/getUserInfo');
        var query = new address();
        query.userId = $routeParams.user;
        query.$save(function(data){
            var obj = new Object();
            obj.id = data[0]._id;
            obj.name = data[0].name;
            $window.localStorage.setItem('session',JSON.stringify(obj));
            $scope.session = JSON.parse($window.localStorage.getItem('session'));
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
    }else{
        var address = $resource('/getUserInfo');
        var query = new address();
        query.userId = $routeParams.user;
        query.$save(function(data){
            $scope.session = JSON.parse($window.localStorage.getItem('session'));
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
    }
        $scope.madeChanges = 0;
        $scope.signOut = function(){
            $window.localStorage.clear('session');
            if(!$scope.email || !$scope.info.password || !$scope.selectedLanguages){
                $scope.deleteMyAccount();
            }
            $window.location.href = '/';
        }

        $scope.scrollTo = function(id) {
            $location.hash(id);
            $anchorScroll();
            $location.hash('');
        }
        $scope.userId = $routeParams.user;
        var getMsgs = $resource('/getMsgs/'+$scope.userId);
        var queMsgs = getMsgs.query(function(){
            $scope.countMsgs = queMsgs.length;
        });
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
        $scope.avaProcess = false;
        $scope.onAvaChange = function(files){
            $scope.avaProcess = true;
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
                            $scope.avaProcess = true;
                            $scope.info.ava = undefined;

                        }).success(function(data, status, headers, config) {
                            if(data!='wrong' && data!='error'){
                                $scope.info.ava = data;
                                $scope.avaProcess = false;
                                $scope.avaError = false;
                            }else{
                                $scope.avaProcess = false;
                                $scope.avaError = data;
                            }
                        });
                });
        };
        $scope.deleteAva = function(){
                var address = $resource('/deleteAva');
                var query = new address();
                query.userId = $scope.info._id;
                query.ava = $scope.info.ava;
                query.$save(function(){
                    $scope.info.ava = undefined;
                });
        }
        $scope.avaProcess = false;
        $scope.onAvaInsert = function(files){
                files.forEach(function(item){
                    $scope.upload = $upload.upload({
                        url: '/insertAvaUser',
                        data: {userId: $scope.info._id
                        },
                        file: item
                    }).progress(function(evt) {
                            var progress = parseInt(100.0 * evt.loaded / evt.total);
                            $scope.progress = progress;
                            $scope.avaProcess = true;

                        }).success(function(data, status, headers, config) {
                            $scope.test = data;
                            if(data!='wrong' && data!='error'){
                                $scope.info.ava = data;
                                $scope.avaProcess = false;
                                $scope.avaError = false;
                            }else{
                                $scope.avaError = data;
                                $scope.avaProcess = false;
                            }
                        });
                });
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
        $scope.checkEmailFormat = function(){
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
        $scope.picsProcess = false;
        $scope.onPicSelect = function($files){
            $scope.picsProcess = true;
            var files = $files;
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
                            $scope.picsProcess = true;
                        }).success(function(data, status, headers, config) {
                            //make result visible
                            $scope.resultInputPicture = data;
                            var addr = $resource('/foldersList/'+$scope.info._id);
                            var que = addr.query(function(){
                                $scope.resFolders = que;
                                $scope.firstPicFolderSelect = 0;
                                $scope.selectFolder($scope.currentPicFolder);
                                $scope.picsProcess = false;
                            });
                        });
                });
        };
        $scope.isEven = function(value) {
            if (value % 2 == 0)
                return true;
            else
                return false;
        };
        $scope.firstPicFolderSelect = 0;
        $scope.selectFolder = function(folder){
            if($scope.currentPicFolder!=folder){
                $scope.firstPicFolderSelect = 0;
            }
            $scope.currentPicFolder = folder;
            var addr = $resource('/picsInFolder/'+$scope.info._id+'/'+folder);
            var que = addr.query(function(){
                $scope.folderPics = que;
                ++$scope.firstPicFolderSelect;
            });
        };
        $scope.deletePic = function(pic,folder){
            var addr = $resource('/deletePic/'+$scope.info._id+'/'+folder+'/'+pic);
            var que = addr.get(function(){
                var addr2 = $resource('/foldersList/'+$scope.info._id);
                var que2 = addr2.query(function(){
                    $scope.resFolders = que2;
                });
            });
            var num = $scope.folderPics[0].photos.indexOf(pic);
            $scope.folderPics[0].photos.splice(num,1);
        }
        $scope.videoProcess = false;
        $scope.onVideoSelect = function(files){
            $scope.videoProcess = true;
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
                            $scope.videoProcess = true;
                        }).success(function(data, status, headers, config) {
                            //make result visible
                            $scope.resultInputVideo = data;
                            var addr = $resource('/foldersVideo/'+$scope.info._id);
                            var que = addr.query(function(){
                                $scope.resFoldersVideo = que;
                                $scope.firstVideoFolderSelect = 0;
                                $scope.selectFolderVideo($scope.currentVideoFolder);
                                $scope.videoProcess = false;
                            });
                        });
                });
        };
        $scope.firstVideoFolderSelect = 0;
        $scope.selectFolderVideo = function(folder){
            if($scope.currentVideoFolder!=folder){
                $scope.firstVideoFolderSelect = 0;
            }
            $scope.currentVideoFolder = folder;
            var addr = $resource('/videosInFolder/'+$scope.info._id+'/'+folder);
            var que = addr.query(function(){
                $scope.folderVideos = que;
                ++$scope.firstVideoFolderSelect;
            });
        };
        $scope.deleteVideo = function(video,folder){
            var addr = $resource('/deleteVideo/'+$scope.info._id+'/'+folder+'/'+video);
            var que = addr.get(function(){
                var addr2 = $resource('/foldersVideo/'+$scope.info._id);
                var que2 = addr2.query(function(){
                    $scope.resFoldersVideo = que2;
                });
            });
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
            que.newPassword = $scope.newPassword;
            que.$save(function(){
                $route.reload();
            });
        }
    $scope.deleteMyAccount = function(){
        var adv = $resource('/deleteMe');
        var que = new adv();
        que.userId = $scope.info._id;
        que.userPwd = $scope.info.password;
        que.$save(function(data){
            $window.localStorage.clear('session');
            $window.location.href = '/';
        });
    }


        $scope.$on('$locationChangeStart', function (event, next, current) {
            event.preventDefault();
            alert('kuku');
        });
});

app.controller('createEvent',function($scope,$rootScope,$resource,$upload,$window,$timeout,$route){
    $scope.session = JSON.parse($window.localStorage.getItem('session'));
    $scope.userId = $scope.session.id;
    $scope.userName = $scope.session.name;

    var getMsgs = $resource('/getMsgs/'+$scope.userId);
    var queMsgs = getMsgs.query(function(){
        $scope.countMsgs = queMsgs.length;
    });


    var adr = $resource('/getMyEvents/'+$scope.userId);
    var que = adr.query(function(){
        $scope.eventsExists = que;
    });
    $scope.deleteEvent = function(title,owner){
        var adr = $resource('/deleteEvent/'+owner+'/'+title);
        var que = adr.get(function(){
            $route.reload();
        });
    }





    $scope.today = new Date();
    var todayYear = $scope.today.getFullYear();
    $scope.expirationMonth = $scope.today.getMonth()+1;
    $scope.expirationDay = $scope.today.getDate();
    $scope.expirationYear = todayYear +1;


    $scope.renderMap = true;
    $scope.lat = 43.2775;
    $scope.lng = 76.89583300000004;
//    Map work
    $scope.map = { center: { latitude: $scope.lat, longitude: $scope.lng}, zoom: 8};
    $scope.marker = {
        id: 0,
        coords: {
            latitude: 43.2775,
            longitude: 76.89583300000004
        },
        options: { draggable: true },
        events: {
            dragend: function (marker, eventName, args) {
                $scope.marker.options = {
                    draggable: true
//                    labelContent: "lat: " + $scope.marker.coords.latitude + ' ' + 'lon: ' + $scope.marker.coords.longitude,
//                    labelAnchor: "100 0",
//                    labelClass: "marker-labels"
                };
            }
        }
    };




//    scope.$on('mapSearchCenter');
    $scope.$on('mapSearchCenter', function() {
        $scope.renderMap = false;
        $timeout(function(){$scope.renderMap = true},1000);
        var geocoder =  new google.maps.Geocoder();
        geocoder.geocode( { 'address': $scope.eventLocationCity}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                $scope.map = { center: { latitude: results[0].geometry.location.lat(), longitude: results[0].geometry.location.lng() }, zoom: 8 };
                $scope.lat = results[0].geometry.location.lat();
                $scope.lng = results[0].geometry.location.lng();
                $scope.marker = {
                    id: 1,
                    coords: {
                        latitude: $scope.lat,
                        longitude: $scope.lng
                    },
                    options: { draggable: true },
                    events: {
                        dragend: function (marker, eventName, args) {

                            $scope.marker.options = {
                                draggable: true
//                                labelContent: "lat: " + $scope.marker.coords.latitude + ' ' + 'lon: ' + $scope.marker.coords.longitude,
//                                labelAnchor: "100 0",
//                                labelClass: "marker-labels"
                            };
                        }
                    }
                };
            }
        });
    });
//    End map work
        $scope.signOut = function(){
            $window.localStorage.clear('session')
            $window.location.href = '/';
        }
        $scope.scrollTo = function(id) {
            $location.hash(id);
            $anchorScroll();
            $location.hash('');
        }
        $scope.resultPics = [];
        $scope.resultVids = [];
        $scope.pictureProgress = false;
        $scope.onPicSelect = function($files){
            var miss = $scope.resultPics.indexOf('wrong format');
            if(miss!='-1') $scope.resultPics.splice(miss,1);
            var files = $files;
                files.forEach(function(item){
                    $scope.upload = $upload.upload({
                        url: '/insertPicturesEvent',
                        data: {userId: $scope.userId,
                            eventTitle: $scope.title
                        },
                        file: item
                    }).progress(function(evt) {
                            var progress = parseInt(100.0 * evt.loaded / evt.total);
                            $scope.progress = progress;
                            $scope.pictureProgress = true;

                        }).success(function(data, status, headers, config) {
                            $scope.resultPics.push(data);
                            $scope.pictureProgress = false;
                        });
                });
        };
        $scope.deletePic = function(pic){
                var adr = $resource('/deletePicEvent');
                var que = new adr();
                que.userId = $scope.userId;
                que.picture = pic;
                que.title = $scope.title;
                que.$save(function(){
                    var oop = $scope.resultPics.indexOf(pic);
                    $scope.resultPics.splice(oop,1);
                });
        }

        $scope.videoProgress = false;
        $scope.onVideoSelect = function($files){
            var files = $files;
            files.forEach(function(item){
                $scope.upload = $upload.upload({
                    url: '/insertVideosEvent',
                    data: {userId: $scope.userId,
                        eventTitle: $scope.title
                    },
                    file: item
                }).progress(function(evt) {
                        var progress = parseInt(100.0 * evt.loaded / evt.total);
                        $scope.progress = progress;
                        $scope.videoProgress = true;
                    }).success(function(data, status, headers, config) {
                        $scope.resultVids.push(data);
                        $scope.videoProgress = false;
                    });
            });
        };
        $scope.deleteVideo = function(video){
            var adr = $resource('/deleteVideoEvent');
            var que = new adr();
            que.userId = $scope.userId;
            que.video = video;
            que.title = $scope.title;
            que.$save(function(){
                var oop = $scope.resultVids.indexOf(video);
                $scope.resultVids.splice(oop,1);
            });
        }
    $scope.submit = function(){
        var adr = $resource('/createEvent');
        var que = new adr();
        que.userId = $scope.userId;
        que.title = $scope.title;
        que.executionDate = $scope.executionDate;
        que.eventLocationCity = $scope.eventLocationCity;
        que.coords = $scope.marker.coords;
        que.phone = $scope.phone;
        que.about = $scope.about;
        que.addressInCity = $scope.addressInCity;
        que.$save(function(){
            $route.reload();
        });
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
                    localStorage.userId = data._id;
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








app.controller('loggedUser',function($scope,$routeParams,$resource,$window,$location,$anchorScroll,$route){
        var net = $routeParams.sn;
        net = net.split('-');
        $scope.idSoc = net[0];
        $scope.net = net[1];
        var adrCh = $resource('/getChanges');
        var queCh = adrCh.query(function(){
            $scope.changes = queCh;
            $scope.eventsChanged = [];
            $scope.changes.forEach(function(event){
                $scope.eventsChanged.push(event.eventId);
            });
        });
        var adr = $resource('/getUser'+$scope.net);
        var que = new adr();
        que.id = $scope.idSoc;
        que.$save(function(data){
            $scope.data = data;
            $scope.userId = data.res[0]._id;


            var getMsgs = $resource('/getMsgs/'+$scope.userId);
            var queMsgs = getMsgs.query(function(){
                $scope.countMsgs = queMsgs.length;
            });


            var myAdr = $resource('/getAddedEvents/'+$scope.userId);
            var myQue = myAdr.query(function(){
                var arrayOfMyPartyEvents = myQue;
                $scope.exMyPartyEvents = [];
                var summ = arrayOfMyPartyEvents.length;
                if($scope.width>992){
                    $scope.exMyPartyEvents = [];
                    var newArrOfMyPartyEv = arrayOfMyPartyEvents.slice(0);
                    var full = Math.floor(summ/4);
                    var rem = summ%4;
                    for(var i=0; i<full; i++){
                        $scope.rowMyPartyEvents = [];
                        $scope.rowMyPartyEvents = newArrOfMyPartyEv.splice(0,4);
                        $scope.exMyPartyEvents.push($scope.rowMyPartyEvents);
                    }
                    if(rem){
                        $scope.rowMyPartyEvents = [];
                        $scope.rowMyPartyEvents = newArrOfMyPartyEv.splice(0,rem);
                        $scope.exMyPartyEvents.push($scope.rowMyPartyEvents);
                    }
                }else if($scope.width<992){
                    $scope.exMyPartyEvents = [];
                    var newArrOfMyPartyEv = arrayOfMyPartyEvents.slice(0);
                    var full = Math.floor(summ/2);
                    var rem = summ%2;
                    for(var i=0; i<full; i++){
                        $scope.rowMyPartyEvents = [];
                        $scope.rowMyPartyEvents = newArrOfMyPartyEv.splice(0,2);
                        $scope.exMyPartyEvents.push($scope.rowMyPartyEvents);
                    }
                    if(rem){
                        $scope.rowMyPartyEvents = [];
                        $scope.rowMyPartyEvents = newArrOfMyPartyEv.splice(0,rem);
                        $scope.exMyPartyEvents.push($scope.rowMyPartyEvents);
                    }
                }
                $scope.$watch('width', function(newValue, oldValue) {
                    if(newValue < 991 && oldValue>992){
                        $scope.exMyPartyEvents = [];
                        var newArrOfMyPartyEv = arrayOfMyPartyEvents.slice(0);
                        var full = Math.floor(summ/2);
                        var rem = summ%2;
                        for(var i=0; i<full; i++){
                            $scope.rowMyPartyEvents = [];
                            $scope.rowMyPartyEvents = newArrOfMyPartyEv.splice(0,2);
                            $scope.exMyPartyEvents.push($scope.rowMyPartyEvents);
                        }
                        if(rem){
                            $scope.rowMyPartyEvents = [];
                            $scope.rowMyPartyEvents = newArrOfMyPartyEv.splice(0,rem);
                            $scope.exMyPartyEvents.push($scope.rowMyPartyEvents);
                        }
                    }else if(newValue > 991 && oldValue<992){
                        $scope.exMyPartyEvents = [];
                        var newArrOfMyPartyEv = arrayOfMyPartyEvents.slice(0);
                        var full = Math.floor(summ/4);
                        var rem = summ%4;
                        for(var i=0; i<full; i++){
                            $scope.rowMyPartyEvents = [];
                            $scope.rowMyPartyEvents = newArrOfMyPartyEv.splice(0,4);
                            $scope.exMyPartyEvents.push($scope.rowMyPartyEvents);
                        }
                        if(rem){
                            $scope.rowMyPartyEvents = [];
                            $scope.rowMyPartyEvents = newArrOfMyPartyEv.splice(0,rem);
                            $scope.exMyPartyEvents.push($scope.rowMyPartyEvents);
                        }
                    };
                });
            })
            var obj = new Object();
            obj.id = data.res[0]._id;
            obj.name = data.res[0].name;
            $window.localStorage.setItem('session',JSON.stringify(obj));
            $scope.session = JSON.parse($window.localStorage.getItem('session'));
            var adr2 = $resource('/getEventsStart/'+data.res[0]._id);
            var que2 = adr2.query(function(){
                var arrayOfEvents = que2;
                $scope.exEvents = [];
                var summ = arrayOfEvents.length;
                if($scope.width>992){
                    $scope.exEvents = [];
                    var newArrOfEv = arrayOfEvents.slice(0);
                    var full = Math.floor(summ/4);
                    var rem = summ%4;
                    for(var i=0; i<full; i++){
                        $scope.rowEvents = [];
                        $scope.rowEvents = newArrOfEv.splice(0,4);
                        $scope.exEvents.push($scope.rowEvents);
                    }
                    if(rem){
                        $scope.rowEvents = [];
                        $scope.rowEvents = newArrOfEv.splice(0,rem);
                        $scope.exEvents.push($scope.rowEvents);
                    }
                }else if($scope.width<992){
                    $scope.exEvents = [];
                    var newArrOfEv = arrayOfEvents.slice(0);
                    var full = Math.floor(summ/2);
                    var rem = summ%2;
                    for(var i=0; i<full; i++){
                        $scope.rowEvents = [];
                        $scope.rowEvents = newArrOfEv.splice(0,2);
                        $scope.exEvents.push($scope.rowEvents);
                    }
                    if(rem){
                        $scope.rowEvents = [];
                        $scope.rowEvents = newArrOfEv.splice(0,rem);
                        $scope.exEvents.push($scope.rowEvents);
                    }
                }
                $scope.$watch('width', function(newValue, oldValue) {
                    if(newValue < 991 && oldValue>992){
                        $scope.exEvents = [];
                        var newArrOfEv = arrayOfEvents.slice(0);
                        var full = Math.floor(summ/2);
                        var rem = summ%2;
                        for(var i=0; i<full; i++){
                            $scope.rowEvents = [];
                            $scope.rowEvents = newArrOfEv.splice(0,2);
                            $scope.exEvents.push($scope.rowEvents);
                        }
                        if(rem){
                            $scope.rowEvents = [];
                            $scope.rowEvents = newArrOfEv.splice(0,rem);
                            $scope.exEvents.push($scope.rowEvents);
                        }
                    }else if(newValue > 991 && oldValue<992){
                        $scope.exEvents = [];
                        var newArrOfEv = arrayOfEvents.slice(0);
                        var full = Math.floor(summ/4);
                        var rem = summ%4;
                        for(var i=0; i<full; i++){
                            $scope.rowEvents = [];
                            $scope.rowEvents = newArrOfEv.splice(0,4);
                            $scope.exEvents.push($scope.rowEvents);
                        }
                        if(rem){
                            $scope.rowEvents = [];
                            $scope.rowEvents = newArrOfEv.splice(0,rem);
                            $scope.exEvents.push($scope.rowEvents);
                        }
                    };
                });
            });
            $scope.addMeToEvent = function(event){
                var adr = $resource('/addMeToEvent/'+$scope.userId+'/'+event);
                var que = adr.get(function(){
                    $route.reload();
                });
            }
            $scope.deleteMeFromEvent = function(event){
                var adr = $resource('/deleteMeFromEvent/'+$scope.userId+'/'+event);
                var que = adr.get(function(){
                    $route.reload();
                });
            }
        });
    $scope.search = function(){
        var adr = $resource('/searchEvents/'+$scope.eventLocationCity);
        var que = adr.query(function(){
            var arrayOfSearchedEvents = que;
            $scope.exSearchedEvents = [];
            var summ = arrayOfSearchedEvents.length;
            if($scope.width>992){
                $scope.exSearchedEvents = [];
                var newArrOfSearchedEv = arrayOfSearchedEvents.slice(0);
                var full = Math.floor(summ/4);
                var rem = summ%4;
                for(var i=0; i<full; i++){
                    $scope.rowSearchedEvents = [];
                    $scope.rowSearchedEvents = newArrOfSearchedEv.splice(0,4);
                    $scope.exSearchedEvents.push($scope.rowSearchedEvents);
                }
                if(rem){
                    $scope.rowSearchedEvents = [];
                    $scope.rowSearchedEvents = newArrOfSearchedEv.splice(0,rem);
                    $scope.exSearchedEvents.push($scope.rowSearchedEvents);
                }
            }else if($scope.width<992){
                $scope.exSearchedEvents = [];
                var newArrSearchedOfEv = arrayOfSearchedEvents.slice(0);
                var full = Math.floor(summ/2);
                var rem = summ%2;
                for(var i=0; i<full; i++){
                    $scope.rowSearchedEvents = [];
                    $scope.rowSearchedEvents = newArrOfSearchedEv.splice(0,2);
                    $scope.exSearchedEvents.push($scope.rowSearchedEvents);
                }
                if(rem){
                    $scope.rowSearchedEvents = [];
                    $scope.rowSearchedEvents = newArrOfSearchedEv.splice(0,rem);
                    $scope.exSearchedEvents.push($scope.rowSearchedEvents);
                }
            }
            $scope.$watch('width', function(newValue, oldValue) {
                if(newValue < 991 && oldValue>992){
                    $scope.exSearchedEvents = [];
                    var newArrOfSearchedEv = arrayOfSearchedEvents.slice(0);
                    var full = Math.floor(summ/2);
                    var rem = summ%2;
                    for(var i=0; i<full; i++){
                        $scope.rowSearchedEvents = [];
                        $scope.rowSearchedEvents = newArrOfSearchedEv.splice(0,2);
                        $scope.exSearchedEvents.push($scope.rowSearchedEvents);
                    }
                    if(rem){
                        $scope.rowSearchedEvents = [];
                        $scope.rowSearchedEvents = newArrOfSearchedEv.splice(0,rem);
                        $scope.exSearchedEvents.push($scope.rowSearchedEvents);
                    }
                }else if(newValue > 991 && oldValue<992){
                    $scope.exSearchedEvents = [];
                    var newArrOfSearchedEv = arrayOfSearchedEvents.slice(0);
                    var full = Math.floor(summ/4);
                    var rem = summ%4;
                    for(var i=0; i<full; i++){
                        $scope.rowSearchedEvents = [];
                        $scope.rowSearchedEvents = newArrOfSearchedEv.splice(0,4);
                        $scope.exSearchedEvents.push($scope.rowSearchedEvents);
                    }
                    if(rem){
                        $scope.rowSearchedEvents = [];
                        $scope.rowSearchedEvents = newArrOfSearchedEv.splice(0,rem);
                        $scope.exSearchedEvents.push($scope.rowSearchedEvents);
                    }
                };
            });
        });
    }
    $scope.width = $window.innerWidth;
    function tellAngular() {
        $scope.$apply(function() {
            $scope.width = $window.innerWidth;
        });
    }
    //calling tellAngular on resize event
    $(window).resize(tellAngular);
    $scope.scrollTo = function(id) {
        $location.hash(id);
        $anchorScroll();
        $location.hash('');
    }
        $scope.signOut = function(){
            $window.localStorage.clear('session')
            $window.location.href = '/';
        }
});

app.controller('infoUser',function($scope,$resource,$routeParams,$window){
    var men = $routeParams.userId;
    var getMsgs = $resource('/getUnsetMsgs/'+$scope.userId);
    var queMsgs = getMsgs.query(function(){
        $scope.newMsgs = queMsgs;
        $scope.countMsgs = queMsgs.length;
    });
    var session = JSON.parse($window.localStorage.getItem('session'));
    $scope.userName = session.name;
    $scope.userId = session.id;

    $scope.messages = [];
    $scope.$watch('messages', function(newValue, oldValue) {
    });


    var socket = io();
    socket.emit('connect me',$scope.userId);
//    socket.connect();

    var adr = $resource('/getUserInfo');
    var que = new adr();
    que.userId = men;
    que.$save(function(data){
        $scope.aboutUser = data;



        $scope.userToName = data.name;
        $scope.userToId = data._id;
        //Chat deal up start
//        io.emit('connect me',$scope.userId);

        $scope.submitMsg = function(){
            var exObj = {};
            if($scope.userToId){
                exObj.userToId = $scope.userToId;
                exObj.userToName = $scope.userToName;
            }else{
                exObj.userToId = men;
                exObj.userToName = $scope.aboutUser.name;
            }
            exObj.userFromId = $scope.userId;
            exObj.userFromName = $scope.userName;
            exObj.msg = $scope.msg;
            socket.emit('message',exObj);
            $scope.msg = undefined;
//            socket.emit('message',$scope.msg);
        }
        socket.on('message', function(msg){
//            var mess = msg.split('_secret user id field : ');
//            var newMsg = mess[0];
//            $scope.messages.push(newMsg);
            $scope.messages.push(msg);
            $scope.$digest();
        });

        $scope.setUserTo = function(userToId,userToName){
            $scope.userToId = userToId;
            $scope.userToName = userToName;
        }

        $scope.$on('$routeChangeStart', function(next, current) {
//            socket.emit('disconnect me',$scope.userId);
            socket.disconnect();
        });
        //Chat deal up end

        var dateOfBirth = new Date(data.date_ofBirth);
        var yearOfBirth = dateOfBirth.getFullYear();
        var monthOfBirth = dateOfBirth.getMonth()+1;
        var dayOfBirth = dateOfBirth.getDate();
        $scope.dateOfBirth = yearOfBirth+'/'+monthOfBirth+'/'+dayOfBirth;
        var arrFolderPics = [];
        $scope.aboutUser.photos.forEach(function(pic){
            arrFolderPics.push(pic.folder);
        });
        $scope.uniqueFoldersPics = arrFolderPics;
        $scope.uniqueFoldersPics.sort();
        $scope.uniqueFoldersPics = $.unique(arrFolderPics);

        var arrFolderVideos = [];
        $scope.aboutUser.videos.forEach(function(video){
            arrFolderVideos.push(video.folder);
        });
        $scope.uniqueFoldersVideos = arrFolderVideos;
        $scope.uniqueFoldersVideos.sort();
        $scope.uniqueFoldersVideos = $.unique(arrFolderVideos);






    });
    $scope.openedFolderPicCount = 0;

    $scope.toggleFolderPics = function(folder){
        ++$scope.openedFolderPicCount;
        $scope.openedFolderPic = folder;
    }
    $scope.openedFolderVideoCount = 0;

    $scope.toggleFolderVideos = function(folder){
        ++$scope.openedFolderVideoCount;
        $scope.openedFolderVideo = folder;
    }

    $scope.isEven = function(value) {
        if (value % 2 == 0)
            return true;
        else
            return false;
    };
    $scope.signOut = function(){
        $window.localStorage.clear('session')
        $window.location.href = '/';
    }
});

app.controller('infoEvent',function($scope,$resource,$routeParams,$window){
    var session = JSON.parse($window.localStorage.getItem('session'));
    $scope.countUsersInfoClicks = 0;
    $scope.userName = session.name;
    $scope.userId = session.id;
    $scope.eventId = $routeParams.eventId;

    var getMsgs = $resource('/getMsgs/'+$scope.userId);
    var queMsgs = getMsgs.query(function(){
        $scope.countMsgs = queMsgs.length;
    });









    $scope.isEven = function(value) {
        if (value % 2 == 0)
            return true;
        else
            return false;
    };
    var adrCh = $resource('/infoEventChanges/'+$scope.eventId+'/'+$scope.userId);
    var queCh = adrCh.query(function(){

    });




    var adr = $resource('/infoEvent/'+$scope.eventId);
    var que = adr.query(function(){
        $scope.info = que;












        $scope.date_exec = new Date($scope.info[0].date_exec);
        var execYear = $scope.date_exec.getFullYear();
        var execMonth = $scope.date_exec.getMonth();
        var execDay = $scope.date_exec.getDate();
        $scope.date_exec = execYear+'/'+execMonth+'/'+execDay;
        $scope.map = {
            center: { latitude: $scope.info[0].coords[0].latitude, longitude: $scope.info[0].coords[0].longitude}, zoom: 8,
            marker:{id:0,latitude:$scope.info[0].coords[0].latitude, longitude: $scope.info[0].coords[0].longitude}
        }
    $scope.mapOptions = {
        control: {},
        zoom: 8,
        options: {
            draggable:true,
            navigationControl: true
        },
        refresh: function () {
            $scope.mapOptions.control.refresh();
        }}
    });
    $scope.findParty = function(people){
        ++$scope.countUsersInfoClicks;
        var arrayOfParty = [];
        people.forEach(function(men){
            var adr = $resource('/getUserInfo');
            var que = new adr();
            que.userId = men;
            que.$save(function(data){

                $scope.newData = data;
                if(data.date_ofBirth){
                    var date = new Date(data.date_ofBirth);
                    var year = date.getFullYear()
                    var month = date.getMonth()+1;
                    var day = date.getDate();
                    $scope.newData.date_ofBirth = year+'/'+month+'/'+day;
                }

               $scope.partyArr = $scope.newData;


                arrayOfParty.push($scope.partyArr);




                $scope.exParty = [];
                var summ = arrayOfParty.length;
                if($scope.width>992){
                    $scope.exParty = [];
                    var newArrOfParty = arrayOfParty.slice(0);
                    var full = Math.floor(summ/4);
                    var rem = summ%4;
                    for(var i=0; i<full; i++){
                        $scope.rowParty = [];
                        $scope.rowParty = newArrOfParty.splice(0,4);
                        $scope.exParty.push($scope.rowParty);
                    }
                    if(rem){
                        $scope.rowParty = [];
                        $scope.rowParty = newArrOfParty.splice(0,rem);
                        $scope.exParty.push($scope.rowParty);
                    }
                }else if($scope.width<992){
                    $scope.exParty = [];
                    var newArrOfParty = arrayOfParty.slice(0);
                    var full = Math.floor(summ/2);
                    var rem = summ%2;
                    for(var i=0; i<full; i++){
                        $scope.rowParty = [];
                        $scope.rowParty = newArrOfParty.splice(0,2);
                        $scope.exParty.push($scope.rowParty);
                    }
                    if(rem){
                        $scope.rowParty = [];
                        $scope.rowParty = newArrOfParty.splice(0,rem);
                        $scope.exParty.push($scope.rowParty);
                    }
                }
                $scope.$watch('width', function(newValue, oldValue) {
                    if(newValue < 991 && oldValue>992){
                        $scope.exParty = [];
                        var newArrOfParty = arrayOfParty.slice(0);
                        var full = Math.floor(summ/2);
                        var rem = summ%2;
                        for(var i=0; i<full; i++){
                            $scope.rowParty = [];
                            $scope.rowParty = newArrOfParty.splice(0,2);
                            $scope.exParty.push($scope.rowParty);
                        }
                        if(rem){
                            $scope.rowParty = [];
                            $scope.rowParty = newArrOfParty.splice(0,rem);
                            $scope.exParty.push($scope.rowParty);
                        }
                    }else if(newValue > 991 && oldValue<992){
                        $scope.exParty = [];
                        var newArrOfParty = arrayOfParty.slice(0);
                        var full = Math.floor(summ/4);
                        var rem = summ%4;
                        for(var i=0; i<full; i++){
                            $scope.rowParty = [];
                            $scope.rowParty = newArrOfParty.splice(0,4);
                            $scope.exParty.push($scope.rowParty);
                        }
                        if(rem){
                            $scope.rowParty = [];
                            $scope.rowParty = newArrOfParty.splice(0,rem);
                            $scope.exParty.push($scope.rowParty);
                        }
                    };
                });

            });
        });
    }
    $scope.width = $window.innerWidth;
    function tellAngular() {
        $scope.$apply(function() {
            $scope.width = $window.innerWidth;
        });
    }
    $(window).resize(tellAngular);
})

app.controller('makeChangesEvent',function($scope,$rootScope,$resource,$upload,$window,$timeout,$route,$routeParams){
    var session = JSON.parse($window.localStorage.getItem('session'));
    $scope.userName = session.name;
    $scope.userId = session.id;
    $scope.eventId = $routeParams.eventId;
    var adr = $resource('/infoEvent/'+$scope.eventId);
    var que = adr.query(function(){
        $scope.infoEvent = que;
        //Started variables neccessary for update
        $scope.title = $scope.infoEvent[0].title;
        $scope.eventLocationCity = $scope.infoEvent[0].destination;
        $scope.addressInCity = $scope.infoEvent[0].addressInCity;
        $scope.about = $scope.infoEvent[0].about;//////////////////
        $scope.phone = $scope.infoEvent[0].phone;
        if(!$scope.about){
            $scope.about = '';
        }
        $scope.addressInCity = $scope.infoEvent[0].addressInCity;//////////////////
        if(!$scope.addressInCity){
            $scope.addressInCity = '';
        }
        $scope.executionDate = $scope.infoEvent[0].date_exec;
        $scope.today = new Date();
        var todayYear = $scope.today.getFullYear();
        $scope.expirationMonth = $scope.today.getMonth()+1;
        $scope.expirationDay = $scope.today.getDate();
        $scope.expirationYear = todayYear +1;
        //Deal with map start
        $scope.renderMap = true;
        $scope.lat = $scope.infoEvent[0].coords[0].latitude;
        $scope.lng = $scope.infoEvent[0].coords[0].longitude;
//    Map work
        $scope.map = { center: { latitude: $scope.lat, longitude: $scope.lng}, zoom: 8};
        $scope.marker = {
            id: 0,
            coords: {
                latitude: $scope.infoEvent[0].coords[0].latitude,
                longitude: $scope.infoEvent[0].coords[0].longitude
            },
            options: { draggable: true },
            events: {
                dragend: function (marker, eventName, args) {
                    $scope.marker.options = {
                        draggable: true
//                    labelContent: "lat: " + $scope.marker.coords.latitude + ' ' + 'lon: ' + $scope.marker.coords.longitude,
//                    labelAnchor: "100 0",
//                    labelClass: "marker-labels"
                    };
                }
            }
        };
//    scope.$on('mapSearchCenter');
        $scope.$on('mapSearchCenter', function() {
            $scope.renderMap = false;
            $timeout(function(){$scope.renderMap = true},1000);
            var geocoder =  new google.maps.Geocoder();
            geocoder.geocode( { 'address': $scope.eventLocationCity}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    $scope.map = { center: { latitude: results[0].geometry.location.lat(), longitude: results[0].geometry.location.lng() }, zoom: 8 };
                    $scope.lat = results[0].geometry.location.lat();
                    $scope.lng = results[0].geometry.location.lng();
                    $scope.marker = {
                        id: 1,
                        coords: {
                            latitude: $scope.lat,
                            longitude: $scope.lng
                        },
                        options: { draggable: true },
                        events: {
                            dragend: function (marker, eventName, args) {

                                $scope.marker.options = {
                                    draggable: true
//                                labelContent: "lat: " + $scope.marker.coords.latitude + ' ' + 'lon: ' + $scope.marker.coords.longitude,
//                                labelAnchor: "100 0",
//                                labelClass: "marker-labels"
                                };
                            }
                        }
                    };
                }
            });
        });
//    End map work
        //End of dealing up with map




    })





    $scope.today = new Date();
    var todayYear = $scope.today.getFullYear();
    $scope.expirationMonth = $scope.today.getMonth()+1;
    $scope.expirationDay = $scope.today.getDate();
    $scope.expirationYear = todayYear +1;












    $scope.signOut = function(){
        $window.localStorage.clear('session')
        $window.location.href = '/';
    }
    $scope.resultPics = [];
    $scope.resultVids = [];
    $scope.pictureProgress = false;
    $scope.onPicSelect = function($files){
        var miss = $scope.resultPics.indexOf('wrong format');
        if(miss!='-1') $scope.resultPics.splice(miss,1);
        var files = $files;
        files.forEach(function(item){
            $scope.upload = $upload.upload({
                url: '/insertPicturesEvent',
                data: {userId: $scope.userId,
                    eventTitle: $scope.title
                },
                file: item
            }).progress(function(evt) {
                    var progress = parseInt(100.0 * evt.loaded / evt.total);
                    $scope.progress = progress;
                    $scope.pictureProgress = true;

                }).success(function(data, status, headers, config) {
                    $scope.resultPics.push(data);
                    $scope.pictureProgress = false;
                });
        });
    };
    $scope.deletedPics = [];
    $scope.deletePic = function(pic,title){
        $scope.deletedPics.push(pic);
        var adr = $resource('/deletePicEvent');
        var que = new adr();
        que.userId = $scope.userId;
        que.picture = pic;
        que.title = title;
        que.$save(function(){
            var oop = $scope.resultPics.indexOf(pic);
            $scope.resultPics.splice(oop,1);
        });
    }

    $scope.videoProgress = false;
    $scope.onVideoSelect = function($files){
        var files = $files;
        files.forEach(function(item){
            $scope.upload = $upload.upload({
                url: '/insertVideosEvent',
                data: {userId: $scope.userId,
                    eventTitle: $scope.title
                },
                file: item
            }).progress(function(evt) {
                    var progress = parseInt(100.0 * evt.loaded / evt.total);
                    $scope.progress = progress;
                    $scope.videoProgress = true;
                }).success(function(data, status, headers, config) {
                    $scope.resultVids.push(data);
                    $scope.videoProgress = false;
                });
        });
    };
    $scope.deleteVideo = function(video,title){
        var adr = $resource('/deleteVideoEvent');
        var que = new adr();
        que.userId = $scope.userId;
        que.video = video;
        que.title = title;
        que.$save(function(){
            var oop = $scope.resultVids.indexOf(video);
            $scope.resultVids.splice(oop,1);
        });
    }
    $scope.submit = function(){
        var adr = $resource('/createEvent');
        var que = new adr();
        que.userId = $scope.userId;
        que.title = $scope.title;
        que.executionDate = $scope.executionDate;
        que.eventLocationCity = $scope.eventLocationCity;
        que.coords = $scope.marker.coords;
        que.phone = $scope.phone;
        que.about = $scope.about;
        que.addressInCity = $scope.addressInCity;
        que.$save(function(){
            var adr2 = $resource('/makeChanges/events/'+$scope.infoEvent[0]._id);
            var que2 = adr2.get(function(){
                $route.reload();
            });
        });

    }
});

app.controller('maintainEvents',function($scope,$resource,$window,$route,uiGmapGoogleMapApi,uiGmapIsReady){
    var session = JSON.parse($window.localStorage.getItem('session'));
    $scope.userName = session.name;
    $scope.userId = session.id;
    var adr = $resource('/getMyEvents/'+session.id);

    var getMsgs = $resource('/getMsgs/'+$scope.userId);
    var queMsgs = getMsgs.query(function(){
        $scope.countMsgs = queMsgs.length;
    });

    var que = adr.query(function(){
        $scope.info = que;

        $scope.open = function(id){
            $('#'+id).collapse();
            $scope.map.refresh();
        }

        });
//
//

    $scope.mapOrderSet = function(event){
        $scope.mapOrder = $scope.info.indexOf(event);
        $scope.map = undefined;
        $scope.map = {
            center: { latitude: event.coords[0].latitude+1, longitude: event.coords[0].longitude-2}, zoom: 8,
            marker:{id:$scope.mapOrder,latitude:event.coords[0].latitude, longitude: event.coords[0].longitude}
        }
    }


    $scope.mapOptions = {
        control: {},
        zoom: 7,
        options: {
            draggable:true,
            disableDefaultUI: true,
                panControl: true,
                navigationControl: true,
//                scrollwheel: false,
                scaleControl: true
        },
        refresh: function () {
            $scope.mapOptions.control.refresh();
        }}



    uiGmapGoogleMapApi.then(function(maps) {
        maps.visualRefresh = true;
        $scope.mapOptions.refresh();
    });

    $scope.deleteEvent = function(title){
        var adr = $resource('/deleteEvent/'+$scope.userId+'/'+title);
        var que = adr.get(function(){
            $route.reload();
        });
    }

    $scope.signOut = function(){
        $window.localStorage.clear('session')
        $window.location.href = '/';
    }
    $scope.countOpeningsPart = 0;
    $scope.toggleParticipants = function(){
        ++$scope.countOpeningsPart;
    }
    $scope.isEven = function(value) {
        if (value % 2 == 0)
            return true;
        else
            return false;
    };
});
app.controller('myMessages',function($scope,$resource,$routeParams,$route,$window){
    var session = JSON.parse($window.localStorage.getItem('session'));
    $scope.userName = session.name;
    $scope.userId = session.id;
    var getMsgs = $resource('/getUnsetMsgs/'+$scope.userId);
    var queMsgs = getMsgs.query(function(){
        $scope.newMsgs = queMsgs;
        $scope.countMsgs = queMsgs.length;
    });
    $scope.messages = [];
    var socket = io();
//    socket.connect();
//    socket.emit('connect me',$scope.userId);
    $scope.$watch('messages', function(newValue, oldValue) {
    });

//    $scope.submitMsg = function(){
//        socket.to($scope.sendMessageTo).emit('message',$scope.userName+' : '+$scope.msg+'_secret user id field : '+$scope.userId);
//    }
//    socket.on('message', function(msg){
//        var messObj = {};
//        var mess = msg.split('_secret user id field : ');
//        messObj.msg = mess[0];
//        messObj.user = mess[1];
//        $scope.messages.push(messObj);
//        $scope.$digest();
//    });

    $scope.signOut = function(){
        $window.localStorage.clear('session');
        $window.location.href = '/';
    }











    socket.emit('connect me',$scope.userId);
//    socket.connect();


        //Chat deal up start
//        io.emit('connect me',$scope.userId);



        $scope.submitMsg = function(){
            var exObj = {};
            exObj.userToId = $scope.userToId;
            exObj.userToName = $scope.userToName;
            exObj.userFromId = $scope.userId;
            exObj.userFromName = $scope.userName;
            exObj.msg = $scope.msg;
            socket.emit('message',exObj);
            $scope.msg = undefined;
//            socket.emit('message',$scope.msg);
        }
        socket.on('message', function(msg){
            $scope.messages.push(msg);
            $scope.$digest();
        });

        $scope.setUserTo = function(userToId,userToName){
            $scope.userToId = userToId;
            $scope.userToName = userToName;
        }








        $scope.$on('$routeChangeStart', function(next, current) {
//            socket.emit('disconnect me',$scope.userId);
            socket.disconnect();
        });
    //Chat deal up end
});