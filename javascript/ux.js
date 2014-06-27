//interactions
var app = angular.module('researcher_app', ['ui.bootstrap']);


app.controller('sort_controller', function($scope) {
});

app.controller('main_controller', function($scope, $http, $modal, $window) {
  /*$scope.deletePaper = function(paper, index) {
    window.freedom.emit('delete_paper', {
      title : paper.title
    });
    var index = this.row.rowIndex;
    $scope.myPapers.splice(index, 1);
  }*/ 

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

/*var FileRead = {
  onLoad: function(file, evt) {
    console.log("File Read Done");
    // Send data to be served. Expect a 'serve-url' response with our descriptor
    var key = Math.random() + "";
    window.freedom.emit('serve-data', {
      key: key,
      value: evt.target.result,
      name: file.name
    });
  } 
};*/ 

var addPaperCtrl = function ($scope, $modalInstance) {
  $scope.upload = function () {
    var files = document.getElementById("addFile").files;
    
    if (files.length < 1) {
      alert("No files found.");
      return;
    }

    uploadFile(files);
    /*console.log("Dropped a file. Let's start reading " + file);
    reader.onload = FileRead.onLoad.bind({}, file);
    reader.readAsArrayBuffer(file);*/ 

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

  window.freedom.emit('add-paper', {
    title: newPaper.name,
    value: newPaper, 
    date: today,
    key: key 
  });
}

function makeRow(url, title) {
  console.log(url + " " + title);
  return "<th><a href=" + url + " target='_blank'>" + title + "</a> by John Doe on 1/1/2014</th>"; 
}

window.freedom.on('display-papers', function(data) {
  console.log('display papers ' + data.length); 
  var paper_table = document.getElementById('paper-table');
  var displayUrl = '#'; 
  for (var i = 0; i < data.length; i++){
    var p = document.createElement('tr'); 
    p.innerHTML = makeRow(displayUrl, data[i].title); 
    paper_table.appendChild(p);
  }
}); 


window.onload = function() {
   window.freedom.emit('load-papers', 0);
} 