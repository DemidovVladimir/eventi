var app = angular.module('myApp',['ngRoute','ngResource','angularFileUpload','google-maps','ngAnimate','youtube-embed','ngAutocomplete','wu.masonry']);



    app.config(function($routeProvider,$locationProvider)
    {
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
            .when('/loginUser',{
                templateUrl:'parts/login.html',
                controller:'loginUser'
            })
            .otherwise({
                redirectTo: '/'
            });
    });



