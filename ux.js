//interactions
var app = angular.module('researcher_app', ['ngGrid']); 

app.controller('main_controller', function($scope, $http) {
  $scope.submitter_dashboard = true; 

  $scope.toReviewer = function() {
    console.log("got here");
    $scope.submitter_dashboard = false; 
  }

  $scope.toSubmitter = function() {
    $scope.submitter_dashboard = true; 
  }

  $http.get('./papers.json').success(function (data) {
    $scope.myPapers = data; 
  });

  $http.get('./reviews.json').success(function (data) {
    $scope.myReviews = data; 
  });

  $scope.paperOptions = { data: 'myPapers' };

  $scope.reviewOptions = { data: 'myReviews' };

  $scope.addPaper = function() {
    console.log("add random paper");
    $scope.myPapers.push({
      date: Math.floor((Math.random() * 1000) + 1000).toString() +'-' + Math.floor((Math.random() * 12) + 1).toString() + '-' + Math.floor((Math.random() * 29) + 1).toString(),
      title: "paper_ex" 
    });
  }
});

window.onload = function() {

  var sbutton = document.getElementById('sbutton'); 
  var rbutton = document.getElementById('rbutton');

  window.freedom.emit('switch-dashboard', 'submitter');

  sbutton.onclick = function() {
    console.log("clicked submitter"); 
    window.freedom.emit('switch-dashboard', 'submitter'); 
  } 

  rbutton.onclick = function() {
    console.log("clicked reviewer");
    window.freedom.emit('switch-dashboard', 'reviewer'); 
  };

  window.freedom.on('to-submitter', function(data) {
    document.getElementById('d-title').innerHTML = 'my papers'; 
  }); 

  window.freedom.on('to-reviewer', function(data) {
    document.getElementById('d-title').innerHTML = 'my reviews'; 
  }); 

}; 



  