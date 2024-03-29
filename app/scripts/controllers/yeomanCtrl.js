'use strict';

/**
 * @ngdoc function
 * @name myTestApp.controller:YeomanController
 * @description
 * # YeomanController
 * Controller of the myTestApp
 */
angular.module('myTestApp')
  .controller('YeomanController', function($scope) {
    // Yeoman part (for tests)
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'Bootstrap',
      'AngularJS',
      'Karma'
    ];
    $scope.today = new Date();
  });
