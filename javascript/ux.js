//interactions
var app = angular.module('researcher_app', ['ui.bootstrap']);


app.controller('sort_controller', function($scope) {
});

app.controller('main_controller', function($scope, $http, $modal, $window) {
  $scope.addPaper = function() {
    console.log("add Paper button");
    var modalInstance = $modal.open({
      templateUrl: 'addPaperTemplate.html',
      windowClass:'normal',
      controller: addPaperCtrl,
      backdrop: 'static'
    });
  };

  $scope.addVersion = function() {
    console.log("add Version button");
    var modalInstance = $modal.open({
      templateUrl: 'addVersionTemplate.html',
      windowClass:'normal',
      controller: addPaperCtrl,
      backdrop: 'static'
    });
  };
}); 

var addPaperCtrl = function ($scope, $modalInstance) {
  $scope.upload = function () {
    var files = document.getElementById("addFile").files;
    
    if (files.length < 1) {
      alert("No files found.");
      return;
    }

    uploadFile(files);

    $modalInstance.dismiss('cancel');
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

function uploadFile(files) {
  var newPaper = files[0];
  var reader = new FileReader(); 

  var today = new Date();  
  var key = Math.random() + "";

  console.log("emit add paper");
  window.freedom.emit('add-paper', {
    title: newPaper.name,
    value: newPaper, 
    date: today,
    key: key 
  });

  reader.readAsArrayBuffer(newPaper); 
}

function downloadPaper(key, title) {
  console.log(key + " " + title); 

  var data = {
    key: key,
    title: title
  };

  var url = window.location + "#" + JSON.stringify(data); 

  alert("download url: " + url); 
}

function makeRow(title, date, key) {
  return '<th><a onclick="downloadPaper(\'' + key + '\',\'' + title + '\')">' + title + '</a> by John Doe on ' + date + '</th>'; 
}

window.freedom.on('display-papers', function(data) {
  console.log('display papers ' + data.length); 
  var paper_table = document.getElementById('paper-table');

  for (var i = paper_table.rows.length; i < data.length; i++){
    var p = document.createElement('tr'); 
    p.innerHTML = makeRow(data[i].title, data[i].date, data[i].key); 
    paper_table.appendChild(p);
  }
}); 

window.onload = function() {
  console.log("page path is " + window.location.pathname);
  if(window.location.pathname == "/static/papers.html" || "/static/browse.html"); 
   window.freedom.emit('load-papers', 0);
} 