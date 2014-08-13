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

    .when('/groupspage', {
      templateUrl : 'pages/groupspage.html',
      controller  : 'groupsController'
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

app.controller('mainController', function($scope, $location) {
  $scope.numAlerts = "";
  $scope.username = "testing"; 
  $scope.showNav = false;  

  $scope.$watch(function(){
    return messageList;
  }, function(newList, oldList){

    $scope.numAlerts = (newList.length === 0) ? "" : newList.length;
  });

  window.freedom.on('alert', function(msg){
    if (!messageList) messageList=[];
    messageList.push(msg);
    $scope.numAlerts = messageList.length;
    alertNum = $scope.numAlerts; 
    $scope.$apply();
  });

  window.freedom.on('recv-uid', function(data) {
    $scope.showNav = true; 
    if(data.onLogin) {
      username = data.id;
      console.log("on login");
      $scope.username_fixed = username; 
      $location.path('profilepage').search({username: username}); 
    }
    if(data.userList) userList = data.userList; 
    $scope.username = data.id; 
    $scope.$apply();
  });
});

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

//TODO: this should be temporary
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

freedom.emit('boot');