describe('myApp controllers', function() {

    beforeEach(function(){
        this.addMatchers({
            toEqualData: function(expected) {
                return angular.equals(this.actual, expected);
            }
        });
    });

    beforeEach(module('myApp'));


    describe('getMenu', function(){
        var scope, ctrl, $httpBackend;

        beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET('/getMenuTotal').
                respond();

            scope = $rootScope.$new();
            ctrl = $controller('getMenu', {$scope: scope});
        }));


        it('5 items', function() {
            expect(scope.info.length).toBe(3);
        });



    });



});