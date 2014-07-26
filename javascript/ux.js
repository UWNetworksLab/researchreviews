//interactions
var app = angular.module('researcherApp', ['ngRoute']);
var currPaper;
var username; 
var alertNum = 0;
var currRPaper;

app.config(function($routeProvider) {
  $routeProvider
    .when('/alertspage', {
      templateUrl : 'pages/alertspage.html',
      controller  : 'alertsController'
    })

    .when('/reviewspage', {
      templateUrl : 'pages/reviewspage.html',
      controller  : 'reviewsController'
    })

    .when('/paperspage', {
      templateUrl : 'pages/paperspage.html',
      controller  : 'papersController'
    })

    .when('/browsepage', {
      templateUrl : 'pages/browsepage.html',
      controller  : 'browseController'
    })

    .when('/profilepage', {
      templateUrl : 'pages/profilepage.html',
      controller  : 'profileController'
    }); 
});

app.controller('alertsController', function($scope) {
  // create a message to display in our view
});

app.controller('reviewsController', function($scope) {
  // create a message to display in our view
});

app.controller('papersController', function($scope) {
  // create a message to display in our view
});

app.controller('browseController', function($scope) {
  // create a message to display in our view
});

app.controller('profileController', function($scope) {
  // create a message to display in our view
});

app.controller('mainController', function($scope) {
  $scope.username_fixed = "testing"; 
});