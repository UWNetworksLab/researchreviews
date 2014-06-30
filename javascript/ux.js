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
  //var blob = new Blob([newPaper], {type: 'application/pdf'});

  //var bloburl = URL.createObjectURL(blob);
  //console.log("url : " + bloburl);

//  var fileBlob = newPaper.slice(0, newPaper.size);

  reader.onload = function() {

    var arrayBuffer = reader.result;
    //var blobURL = window.URL.createObjectURL(fileBlob);
    var today = new Date();  
    var key = Math.random() + "";

    //console.log("blob " + blob);
    //console.log("blob stringy " + JSON.stringify(blob));



    //var blob = new Blob([reader.result], {type: 'application/pdf'});
    //var bloburl = URL.createObjectURL(blob);
    //console.log("uploadfile end: " + bloburl);


    console.log("emit add paper");
    window.freedom.emit('add-paper', {
      title: newPaper.name,
      date: today,
      key: key,
      binaryString: abToString(arrayBuffer)
    });
  }
  reader.readAsArrayBuffer(newPaper);
//reader.readAsBinaryString(newPaper);
}

function downloadPaper(key) {
  console.log("key " + key);
  window.freedom.emit('download-paper', {paperkey: key});
//  alert("download url: "); 
}

function abToString(ab){
  var binary = '';
  var bytes = new Uint8Array(ab);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++){
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function stringToAB(string){
  var bytes = new Uint8Array(string.length);
  for (var i = 0; i < string.length; i++){
    bytes[i] = string.charCodeAt(i);
  }
  return bytes.buffer;
}

window.freedom.on('got-paper', function(data){
  console.log("got paper "); //data is string
  var ab = stringToAB(data);

  var reader = new FileReader();


  var blob = new Blob([ab], {type:'application/pdf'});
  reader.readAsArrayBuffer(blob);
saveAs(blob, "downloadstuff"); 
  //var bloburl = URL.createObjectURL(blob);
  //window.location.href = bloburl;
});

function makeRow(title, date, key) {
  return '<th><a onclick="downloadPaper(' + key + ')"">' + title + '</a> by John Doe on ' + date + '</th>'; 
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