//define(['angular', 'angularMocks', 'app'], function() {
  'use strict';

  //browser.ignoreSynchronization = false;

  describe('Controller: MainCtrl', function() {

    // load the controller's module
    beforeEach(module('myTestApp.controllers.MainController'));

    var MainCtrl,
      scope,
      $httpBackend;

    // Initialize the controller and a mock scope
    beforeEach(inject(function(_$httpBackend_, $controller, $rootScope) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('/api/awesomeThings')
        .respond(['HTML5 Boilerplate', 'Bootstrap', 'AngularJS', 'Karma']);

      scope = $rootScope.$new();

      MainCtrl = $controller('MainCtrl', {
        $scope: scope
      });
    }));

    it('should attach a list of awesomeThings to the scope', function() {
      should.not.exist(scope.awesomeThings);
      $httpBackend.flush();
      expect(scope.awesomeThings).to.have.length(4);
    });
  });

//});
