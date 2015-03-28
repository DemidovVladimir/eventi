var app = angular.module('enveti',['ngRoute','ngResource','angularFileUpload','ngAnimate','youtube-embed','uiGmapgoogle-maps','ngAutocomplete','wu.masonry','mgcrea.ngStrap','ui.unique','ui.bootstrap','ui.date']);

//ng-app="enveti"
    app.config(function($routeProvider,$locationProvider,$compileProvider)
    {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|skype):/);
        $locationProvider.html5Mode(true);
        // Register routes with the $routeProvider
        $routeProvider
            .when('/', {
                templateUrl:"parts/home.html",
                controller:'home'
            })
            .when('/registerUser',{
                templateUrl:'parts/registerUser.html',
                controller:'registerUser'
            })
            .when('/maintainUser:user',{
                templateUrl: 'parts/maintainUser.html',
                controller:'maintainUser'
            })
            .when('/loggedUser:sn',{
                templateUrl:'parts/loggedUser.html',
                controller:'loggedUser'
            })
            .when('/createEvent',{
                templateUrl:'parts/createEvent.html',
                controller:'createEvent'
            })
            .when('/infoEvent:eventId',{
                templateUrl:'parts/infoEvent.html',
                controller:'infoEvent'
            })
            .when('/maintainEvents',{
                templateUrl:'parts/maintainEvents.html',
                controller:'maintainEvents'
            })
            .when('/manageEvent',{
                templateUrl:'parts/manageEvent.html',
                controller:'manageEvent'
            })
            .when('/infoUser:userId',{
                templateUrl:'parts/infoUser.html',
                controller:'infoUser'
            })
            .when('/makeChangesEvent:eventId',{
                templateUrl:'parts/makeChangesEvent.html',
                controller:'makeChangesEvent'
            })
            .when('/myMessages:userId',{
                templateUrl:'parts/myMessages.html',
                controller:'myMessages'
            })
            .otherwise({
                redirectTo: '/'
            });
    });



app.filter('myObjectFilter', function () {
    return function (items, search) {
        var result = [];
        angular.forEach(items, function (value, key) {
            if(value.folder == search){
                result.push(value);
            }else if(!search && search==null){
                result.push(value);
            }
        });
        return result;
    }
});


