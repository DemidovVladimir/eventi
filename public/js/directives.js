'use strict';


app

.directive('autoComplete', function($timeout) {
        return {
            restrict: 'A',
            transclude: true,
            //scope: {},
            link:function(scope,element,attrs){
                element.autocomplete({
                    source: scope[attrs.items],
                    select: function() {
                        $timeout(function() {
                            element.trigger('input');
                            scope.$emit('inputLanguage');
                        }, 0);
                    },
                    close: function() {
                        $timeout(function() {
                            scope.$emit('clearInputLanguage');
                        }, 0);
                    }
                });
            }
        };
})
    .directive('autoCompleteFilter', function($timeout) {
        return {
            restrict: 'A',
            transclude: true,
            //scope: {},
            link:function(scope,element,attrs){
                element.autocomplete({
                    source: scope[attrs.items],
                    select: function() {
                        $timeout(function() {
                            element.trigger('input');
                            scope.$emit('inputFilterLanguage');
                        }, 0);
                    },
                    close: function() {
                        $timeout(function() {
                            scope.$emit('clearFilterLanguage');
                        }, 0);
                    }
                });
            }
        };
    })
    // Angular File Upload module does not include this directive
    // Only for example


/**
 * The ng-thumb directive
 * @author: nerv
 * @version: 0.1.2, 2014-01-09
 *
 *
 */

    .directive('listUser',function(){
        return {
            restrict: 'E',
            link:function(scope,element,attrs){
            },
            templateUrl: 'parts/userList.html'
        };
    })
    .directive('mainCarousel',function(){
        return {
            restrict: 'E',
            transclude: true,
            scope: {},
            link:function($scope,$element){
                $element.swiperight(function() {
                    $('#myCarousel_1 .left').trigger('click');
                });
                $element.swipeleft(function(){
                    $('#myCarousel_1 .right').trigger('click');
                });
            },
            templateUrl: 'parts/mainCarousel.html'
        };
    })
    .directive('mainCarouselSecond',function(){
        return {
            restrict: 'E',
            transclude: true,
            scope: {},
            link:function($scope,$element){
                $element.swiperight(function() {
                    $('#myCarousel_4 .left').trigger('click');
                });
                $element.swipeleft(function(){
                    $('#myCarousel_4 .right').trigger('click');
                });
            },
            templateUrl: 'parts/mainCarouselSecond.html'
        };
    })

    .directive('ngThumb', ['$window', function($window) {
        var helper = {
            support: !!($window.FileReader && $window.CanvasRenderingContext2D),
            isFile: function(item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function(file) {
                var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        };

        return {
            restrict: 'A',
            template: '<canvas/>',
            link: function(scope, element, attributes) {
                if (!helper.support) return;

                var params = scope.$eval(attributes.ngThumb);

                if (!helper.isFile(params.file)) return;
                if (!helper.isImage(params.file)) return;

                var canvas = element.find('canvas');
                var reader = new FileReader();

                reader.onload = onLoadFile;
                reader.readAsDataURL(params.file);

                function onLoadFile(event) {
                    var img = new Image();
                    img.onload = onLoadImage;
                    img.src = event.target.result;
                }

                function onLoadImage() {
                    var width = params.width || this.width / this.height * params.height;
                    var height = params.height || this.height / this.width * params.width;
                    canvas.attr({ width: width, height: height });
                    canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                }
            }
        };
    }]);



app.directive('inputFile',function($resource,$route,$upload){
        return{
            restrict:'E',
            link:function(scope,element,attrs){
                var files;
                scope.onFileSelect = function($files){
                     files = $files;
                    scope.files = [];
                    files.forEach(function(item){
                        scope.upload = $upload.upload({
                            url: 'addFilesTo/equipment',
                             data: {titleEl : scope.fileType,
                             equipment_title:scope.title
                             },
                            file: item
                        }).progress(function(evt) {
                                var progress = parseInt(100.0 * evt.loaded / evt.total);
                                scope.progress = progress;

                            }).success(function(data, status, headers, config) {
                                scope.files.push(item);
                                //$route.reload();
                            });
                    });
                };

                scope.deleteEquipmentFile = function(file){
                    var Todo = $resource('/deleteFileEquipment/'+scope.fileType+'/'+file);
                    var info = Todo.query();
                    var indexOf = scope.files.indexOf(file);
                    scope.files.splice(indexOf, 1);
                }
            },
            templateUrl:'parts/inputFile.html'
        }
    });

app.directive('inputArea',function($resource,$route,$upload){
    return{
        restrict:'E',
        link:function(scope,element,attrs){
            var files;
            scope.onFileSelect = function($files){
                files = $files;
                scope.files = [];
                files.forEach(function(item){
                    scope.upload = $upload.upload({
                        url: 'addFilesTo/areas',
                        data: {
                            area_title:scope.title
                        },
                        file: item
                    }).progress(function(evt) {
                            var progress = parseInt(100.0 * evt.loaded / evt.total);
                            scope.progress = progress;

                        }).success(function(data, status, headers, config) {
                            scope.files.push(item);
                            //$route.reload();
                        });
                });
            };

            scope.deleteEquipmentFile = function(file){
                var Todo = $resource('/deleteFileArea/'+file);
                var info = Todo.query();
                var indexOf = scope.files.indexOf(file);
                scope.files.splice(indexOf, 1);
            }
        },
        templateUrl:'parts/inputFile.html'
    }
});


app.directive('inputFileArea',function($resource,$route,$upload){
    return{
        restrict:'E',
        link:function(scope,element,attrs){

        },
        templateUrl:'parts/inputFileArea.html'
    }
});

app.directive('inputCategoryFile',function($resource,$route,$upload){
    return{
        restrict:'E',
        link:function(scope,element,attrs){
            var files;
            scope.onFileSelect = function($files){
                files = $files;
                scope.files = [];
                files.forEach(function(item){
                    scope.upload = $upload.upload({
                        url: 'addFilesTo/category',
                        data: {titleEl : scope.fileType,
                            category_title:scope.title
                        },
                        file: item
                    }).progress(function(evt) {
                            var progress = parseInt(100.0 * evt.loaded / evt.total);
                            scope.progress = progress;

                        }).success(function(data, status, headers, config) {
                            scope.files.push(item);
                            //$route.reload();
                        });
                });
            };


            scope.deleteCategoryFile = function(file){
                var Todo = $resource('/deleteFileCategory/'+scope.fileType+'/'+file);
                var info = Todo.query();
                var indexOf = scope.files.indexOf(file);
                scope.files.splice(indexOf, 1);
            }
        },

        templateUrl:'parts/inputCategoryFile.html'
    }
});

app.directive('menuEquipment',function($resource){
    return{
        restrict:'E',
        link:function(scope,element,attrs){
            var todo_1 = $resource('/getCategoriesTotal');
            var cats = todo_1.query(function(){
                scope.cats = cats;
            });

            scope.collectData = function(cat){
                var todo_2 = $resource('/getEquipmentsTotal/'+cat);
                var equipments = todo_2.query(function(){
                    scope.equipmentsInCat = equipments;
                });
            };
        },
        templateUrl:'parts/menuEquipment.html'
    }
});

app.directive('youtube',function($resource,$routeParams,$sce){
    return{
        restrict:'E',
        link:function(scope,element,attrs){

            scope.videoSafe = $sce.trustAsResourceUrl(scope.video.videoLink);
                /*if(video[0].videoLink.length!=1){
                    video[0].videoLink.forEach(function(item){
                        var trusted = $sce.trustAsResourceUrl(item);
                        scope.videoLinks.push(trusted);
                    });
                }else{
                    var trusted = $sce.trustAsResourceUrl(video[0].videoLink);
                    scope.videoLinks.push(trusted);
                }*/






        },
        templateUrl:'parts/youtube.html'
    }
});
app.directive('activePhotoAreas',function(){
    return{
        restrict:'E',
        link:function(scope,element,attrs){
        },
        templateUrl:'parts/activePhotoAreas.html'
    }
});
app.directive('singlePhotoAreas',function(){
    return{
        restrict:'E',
        link:function(scope,element,attrs){
        },
        templateUrl:'parts/singlePhotoAreas.html'
    }
});
app.directive('activePhotoEquipments',function(){
    return{
        restrict:'E',
        link:function(scope,element,attrs){
        },
        templateUrl:'parts/activePhotoEquipments.html'
    }
});
app.directive('singlePhotoEquipments',function(){
    return{
        restrict:'E',
        link:function(scope,element,attrs){
        },
        templateUrl:'parts/singlePhotoEquipments.html'
    }
});

app.directive('customVideo',function($resource,$routeParams,$sce){
    return{
        restrict:'E',
        link:function(scope,element,attrs){

            scope.videoSafe = $sce.trustAsResourceUrl('/uploaded/'+scope.info._id+'/'+scope.folderVideos[0]._id+'/'+scope.video);
            /*if(video[0].videoLink.length!=1){
             video[0].videoLink.forEach(function(item){
             var trusted = $sce.trustAsResourceUrl(item);
             scope.videoLinks.push(trusted);
             });
             }else{
             var trusted = $sce.trustAsResourceUrl(video[0].videoLink);
             scope.videoLinks.push(trusted);
             }*/






        },
        templateUrl:'parts/customVideo.html'
    }
});







