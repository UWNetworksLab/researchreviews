//interactions
var app = angular.module('researcher_app', ['ngGrid']);
var show_addpaper = true; 

app.controller('table_controller', function($scope) {
  $scope.show_addpaper = show_addpaper; 

  $scope.myPapers = [{date: "1996-11-06", title: "paper a"},
                    {date: "1998-11-17", title: "paper b"},
                    {date: "2000-01-01", title: "paper c"}];

  $scope.gridOptions = { data: 'myPapers'};

  $scope.addPaper = function() {
    console.log("add random paper");
    $scope.myPapers.push({
      date: Math.floor((Math.random() * 2000) + 1000).toString() +'-' + Math.floor((Math.random() * 12) + 1).toString() + '-' + Math.floor((Math.random() * 29) + 1).toString(),
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
    show_addpaper = true;
    document.getElementById('d-title').innerHTML = 'my papers'; 
  }); 

  window.freedom.on('to-reviewer', function(data) {
    show_addpaper = false; 

    document.getElementById('d-title').innerHTML = 'my reviews'; 
  }); 

};



  