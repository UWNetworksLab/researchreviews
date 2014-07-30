//interactions

//storebuffer
var app = angular.module('researcherApp', ['ngRoute', 'ui.bootstrap']);
var username;
var userList = [];
var alertNum = 0;
var messageList = [];
var oldMessageList = [];

//we have to make it an array, not associative array: it won't be in order unless we give an index.
window.freedom.on('new-user', function(newUser){
  if(newUser !== 'publicstorage' && newUser !== username)
    userList.push(newUser); 
});

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

app.controller('profileController', function($scope) {
  // create a message to display in our view
});

app.controller('mainController', function($scope) {
  $scope.numAlerts = "";
  $scope.username = "testing"; 
  // Display our own userId when we get it

  $scope.$watch(function(){
    return messageList;
  }, function(newList, oldList){

    $scope.numAlerts = (newList.length === 0) ? "" : newList.length;
  });

  window.freedom.on('alert', function(msg){
    console.log("ALERT IN UX");
    if (!messageList) messageList=[];
    messageList.push(msg);
    $scope.numAlerts = messageList.length;
    $scope.$apply();
  });

  window.freedom.on('recv-uid', function(data) {
    username = data.id;
    if(data.onLogin) $scope.username = username; 
    userList = data.userList;
    $scope.$apply();
    //TODO: show profile page
  });
});