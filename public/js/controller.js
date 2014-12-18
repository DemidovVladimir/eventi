'use strict';



app.controller('total',function($scope,$resource,$window){
    $scope.test = 'Kuku';
    $scope.logout = function(){
        sessionStorage.userId = undefined;
        $window.location.href = '/';
    }
});





app.controller('home',function($scope,$resource,$window,$document, $location, $anchorScroll){
    var sess = $window.sessionStorage.getItem('session');
    if(sess){
        $scope.sessionId = JSON.parse($window.sessionStorage.getItem('session')).id;
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
                        //$window.sessionStorage.setItem('userId', JSON.stringify(data._id))
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
                var obj = new Object();
                obj.id = data._id;
                obj.name = data.name;
                $window.sessionStorage.setItem('session', JSON.stringify(obj));
                $window.location.href='/loggedUser'+data._id+'-'+'local';
            });
    }
});








app.controller('maintainUser',function($scope,$routeParams,$resource,$upload,$window,$route,$location,$anchorScroll){
    $scope.sessionId = JSON.parse($window.sessionStorage.getItem('session')).id;
    if($scope.sessionId != $routeParams.user && !$scope.sessionId){
        $window.location.href = '/';
    }else{
        $scope.signOut = function(){
            $window.sessionStorage.clear('session')
            $window.location.href = '/';
        }

        $scope.scrollTo = function(id) {
            $location.hash(id);
            $anchorScroll();
            $location.hash('');
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

                        }).success(function(data, status, headers, config) {
                            $scope.info.ava = data;
                            $scope.avaProcess = false;
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
        $scope.onAvaInsert = function(files){
            $scope.avaProcess = true;
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
                            $scope.avaProcess = false;
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
                        }).success(function(data, status, headers, config) {
                            //make result visible
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

                        }).success(function(data, status, headers, config) {
                            //make result visible
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
            que.$save(function(){
                $route.reload();
            });
        }
    }
});

app.controller('createEvent',function($scope,$rootScope,$resource,$upload,$window,$timeout,$route){
    $scope.session = JSON.parse($window.sessionStorage.getItem('session'));
    $scope.userId = $scope.session.id;
    $scope.userName = $scope.session.name;

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
            $window.sessionStorage.clear('session')
            $window.location.href = '/';
        }
        $scope.scrollTo = function(id) {
            $location.hash(id);
            $anchorScroll();
            $location.hash('');
        }
        $scope.resultPics = [];
        $scope.resultVids = [];
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

                        }).success(function(data, status, headers, config) {
                            $scope.resultPics.push(data);
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
        $scope.onVideoSelect = function($files){
            var miss = $scope.resultVids.indexOf('wrong format');
            if(miss!='-1') $scope.resultVids.splice(miss,1);
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

                    }).success(function(data, status, headers, config) {
                        $scope.resultVids.push(data);
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








app.controller('loggedUser',function($scope,$routeParams,$resource,$window,$location,$anchorScroll){


        var net = $routeParams.sn;
        net = net.split('-');
        $scope.idSoc = net[0];
        $scope.net = net[1];
        var adr = $resource('/getUser'+$scope.net);
        var que = new adr();
        que.id = $scope.idSoc;
        que.$save(function(data){
            $scope.data = data;
            $scope.userId = data.res[0]._id;
            var obj = new Object();
            obj.id = data.res[0]._id;
            obj.name = data.res[0].name;
            $window.sessionStorage.setItem('session',JSON.stringify(obj));
            $scope.session = JSON.parse($window.sessionStorage.getItem('session'));
        });

    $scope.scrollTo = function(id) {
        $location.hash(id);
        $anchorScroll();
        $location.hash('');
    }


        $scope.signOut = function(){

            $window.sessionStorage.clear('session')
            $window.location.href = '/';

        }


});
