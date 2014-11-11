app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/menu', {
                template:"Yumm"
            }).
            when('/setMenu', {
                templateUrl: 'parts/kuku.html',
                controller: 'kuku'
            }).
            otherwise({
                redirectTo: '/menu'
            });
    }]);