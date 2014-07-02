//interactions
var app = angular.module('researcher_app', ['ui.bootstrap']);
var currPaperKey = -1; 
var currPaperVersion = -1; 

app.controller('drop_controller', function($scope) {
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
      controller: addVersionCtrl,
      backdrop: 'static'
    });
  };
}); 

/* arraybuffer/string conversion */
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

var addPaperCtrl = function ($scope, $modalInstance) {
  $scope.upload = function () {
    var files = document.getElementById("addFile").files;
    var comments = document.getElementById("add-paper-comments").value;
    
    if (files.length < 1) {
      alert("No files found.");
      return;
    }

    uploadFile(files, comments);
    $modalInstance.dismiss('cancel');
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

var addVersionCtrl = function ($scope, $modalInstance) {
  $scope.upload = function () {
    var files = document.getElementById("addFile").files;
    var comments = document.getElementById("add-version-comments").value;
    
    if (files.length < 1) {
      alert("No files found.");
      return;
    }

    uploadFile(files, comments, currPaperKey);
    $modalInstance.dismiss('cancel');
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

function uploadFile(files, comments, key) {
  var newPaper = files[0];
  var reader = new FileReader();

  reader.onload = function() {
    var arrayBuffer = reader.result;
    var today = new Date();  
    var dd = today.getDate();
    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();
    today = yyyy+'-'+mm+'-'+dd; 


    console.log("emit add paper");
    window.freedom.emit('add-paper', {
      title: newPaper.name,
      date: today,
      key: key,
      comments: comments, 
      binaryString: ab2str(arrayBuffer)
    });
  }
  reader.readAsArrayBuffer(newPaper);
}

function downloadVersion() {
  console.log("key " + currPaperKey);
  window.freedom.emit('download-version', {
    key: currPaperKey,
    vnum: currPaperVersion 
  });
}

window.freedom.on('got-paper', function(data){
  console.log("got paper "); //data is string
  var ab = str2ab(data.string);

  var reader = new FileReader();


  var blob = new Blob([ab], {type:'application/pdf'});
  reader.readAsArrayBuffer(blob);
  saveAs(blob, data.title); 
});

function deletePaper(){
  console.log("delete : "  + currPaperKey);
  window.freedom.emit('delete-paper', currPaperKey);
}

function makeRow(title, date, key) {
  return '<th onclick="freedom.emit(\'find-paper\', {key:' + key + '})">' + title + ' by John Doe on ' + date + '</th>'; 
}

function updateTable(data, updateAction) {
  var paper_table = document.getElementById('paper-table');
  if(updateAction == 1) {
    var versionLen = data.versions.length-1; 
    var p = document.createElement('tr'); 
    p.setAttribute("id", data.key);
    p.innerHTML = makeRow(data.versions[versionLen].title, data.versions[versionLen].date, data.key); 
    paper_table.appendChild(p);
  }

  else if (updateAction == -1){
    for (var i = 0; i < paper_table.rows.length; i++){
      if (data == paper_table.rows[i].getAttribute("id")){
        paper_table.deleteRow(i);
      }
    }
  }
}

function updateView(version, updateAction) { //get newest version of uploaded paper/paper you were looking at 
  var paper_view = document.getElementById("paper-view-container");
  paper_view.getElementsByTagName("h1")[0].innerHTML = version.title + " v." + version.vnum;
  paper_view.getElementsByTagName("p")[0].innerHTML = version.comments;  
}

window.freedom.on('display-delete-paper', function(key) {
  currPaperKey = -1; 
  currPaperVersion = -1; 

  updateTable(key, -1); 
//  updateView(paper.versions[0], 1); 
});

window.freedom.on('display-new-paper', function(paper) {
  updateTable(paper, 1); 
  currPaperKey = paper.key; 
  currPaperVersion = 0; 
  updateView(paper.versions[0], 1); 
});

window.freedom.on('display-new-version', function(paper) {
  currPaperKey = paper.key; 
  currPaperVersion = paper.versions.length-1; 
  updateView(paper.versions[paper.versions.length-1], 1); 
});


function getVersion(offset) {
  window.freedom.emit('find-paper', {
    key: currPaperKey, 
    vnum: currPaperVersion+offset 
  }); 
}

window.freedom.on("found-paper", function(version) {
  currPaperVersion = version.vnum; 
  currPaperKey = version.key; 
  console.log("on found paper, curr paper key :" + currPaperKey);
  console.log("current version: " + currPaperVersion);
  updateView(version, 1);  
}); 

/*window.freedom.on('display-papers', function(data) {
  console.log('display papers ' + data.paperAction); 
  var paper_table = document.getElementById('paper-table');

  if (data.paperAction == -1){
    for (var i = 0; i < paper_table.rows.length; i++){
      if (data.key == paper_table.rows[i].getAttribute("id")){
        paper_table.deleteRow(i);
      }
    }
    freedom.emit('show-paper', -1);
  }
  else if (data.paperAction == 1) {
    var p = document.createElement('tr'); 
    p.setAttribute("id", data.key);
    p.innerHTML = makeRow(data.value.title, data.value.date, data.key); 
    paper_table.appendChild(p);
  }
}); */

window.freedom.on('display-paper-table', function(papers){
  var paper_table = document.getElementById('paper-table');
  for (var i = paper_table.rows.length; i < papers.length; i++){
    var p = document.createElement('tr'); 
    p.setAttribute("id", papers[i].key);
    var len = papers[i].versions.length-1; 
    p.innerHTML = makeRow(papers[i].versions[len].title, papers[i].versions[len].date, papers[i].key); 
    paper_table.appendChild(p);    
  }
});
/*
window.freedom.on('show-paper-view', function(data) {
  var paper_view = document.getElementById("paper-view-container");
  if(data == -1) {
    paper_view.getElementsByTagName("h1")[0].innerHTML = ""; 
    paper_view.getElementsByTagName("p")[0].innerHTML = ""; 
    return; 
  }
  currPaperKey = data.key; 
  console.log("show paper view " + data.title + " " + currPaperKey);
  paper_view.getElementsByTagName("h1")[0].innerHTML = data.title;
  paper_view.getElementsByTagName("p")[0].innerHTML = data.comments; 
});*/ 


function login() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  console.log(username + " " + password);

  document.cookie = "username="+username; 
  showPage("papers-page");
}

// show the given page, hide the rest
function showPage(id) {
  console.log("show page: " + id);
    var pg = document.getElementById(id);
    if (!pg) {
        alert("no such page");
        return;
    }

    // get all pages, loop through them and hide them
    var pages = document.getElementsByClassName('page');
    for(var i = 0; i < pages.length; i++) 
        pages[i].style.display = 'none';

    /*if(id === "papers-page" || id === "browse-page") {
      window.freedom.emit('load-papers', 0);
    }*/ 

    if(id === "papers-page") {
      window.freedom.emit('get-paper-table', 0);
    }

    pg.style.display = 'block';
}

window.onload = function() {
  showPage("login-page");
} 