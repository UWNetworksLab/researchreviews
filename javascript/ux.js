//interactions
var app = angular.module('researcher_app', ['ui.bootstrap']);
var currPaper;
var username; 
var alertNum = 0;
var currRPaper;

app.controller('drop_controller', function($scope) {
}); 

app.controller('main_controller', function($scope, $http, $modal, $window) {
  $scope.username = "testing"; 

  // Display our own userId when we get it
  window.freedom.on('recv-uid', function(data) {
    $scope.username = data; 
    username = data; 
    $scope.$apply();
    showPage('profile-page');
  });

  $scope.addPaper = function() {
    var modalInstance = $modal.open({
      templateUrl: 'addPaperTemplate.html',
      windowClass:'normal',
      controller: addPaperCtrl,
      backdrop: 'static'
    });
  };

  $scope.editProfile = function() {
    var modalInstance = $modal.open({
      templateUrl: 'editProfileTemplate.html',
      windowClass:'normal',
      controller: editProfileCtrl,
      backdrop: 'static'
    });
  };

  $scope.addReview = function() {
    var modalInstance = $modal.open({
      templateUrl: 'addReviewTemplate.html',
      windowClass:'normal',
      controller: addReviewCtrl,
      backdrop: 'static'
    });
  };

  $scope.addVersion = function() {
    var modalInstance = $modal.open({
      templateUrl: 'addVersionTemplate.html',
      windowClass:'normal',
      controller: addVersionCtrl,
      backdrop: 'static'
    });
  };

  $scope.inviteReviewers = function() {
    window.freedom.emit('get-users', 0);
  };

  window.freedom.on('send-users', function(userList) {
    var modalInstance = $modal.open({
      templateUrl: 'inviteReviewersTemplate.html',
      windowClass:'normal',
      controller: inviteReviewersCtrl,
      backdrop: 'static', 
      resolve: {
        userList: function () {
          return userList;
        }
      }
    });
  }); 
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

var editProfileCtrl = function ($scope, $modalInstance) {
  //TODO: get email 
  $scope.upload = function () {
    var files = document.getElementById("addFile").files;
  
    if (files.length < 1) {
      alert("No files found.");
      return;
    }

    changeProfile(files, document.getElementById("profile_description_modal").value);
    $modalInstance.dismiss('cancel');
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

var addReviewCtrl = function ($scope, $modalInstance) {
  $scope.upload = function () {
    console.log("got to add review ctrl");
    var files = document.getElementById("addFile").files;
    
    if (files.length < 1) {
      alert("No files found.");
      return;
    }

    var reader = new FileReader();
    reader.onload = function() {
      var arrayBuffer = reader.result;
      var today = new Date();  
      var dd = today.getDate();
      var mm = today.getMonth()+1; 
      var yyyy = today.getFullYear();
      today = yyyy+'-'+mm+'-'+dd; 

      var data = {
        author: currRPaper.author,
        key: currRPaper.key,
        vnum: currRPaper.vnum,
        string: ab2str(arrayBuffer),
        name: files[0].name,
        reviewer: username,
        action: 'add-review',
        date: today
      };

      window.freedom.emit('upload-review', JSON.stringify(data));
    }
    reader.readAsArrayBuffer(files[0]);    


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

    uploadFile(files, comments, currPaper.key);
    $modalInstance.dismiss('cancel');
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

var inviteReviewersCtrl = function ($scope, $modalInstance, userList) {
  $scope.states = userList; 

  $scope.invite = function () {
    //invite reviewers 
    var reviewer_input = document.getElementById("reviewer-input").value; 

    var msg = {
      title: document.getElementById("paper-view-container").getElementsByTagName("h1")[0].innerHTML,
      action: 'invite-reviewer',
      key: currPaper.key,
      author: username,
      vnum: currPaper.vnum
    };

    freedom.emit('send-message', {
      to: reviewer_input,
      msg: JSON.stringify(msg)
    });
    
    $modalInstance.dismiss('cancel');
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

function changeProfile(files, profile_description) {
  //console.log(profile_description);
  document.getElementById("profile-page").getElementsByTagName("p")[0].innerHTML = profile_description; 

  var url = window.URL.createObjectURL(files[0]);
  //console.log(url);
  document.getElementById("profile_pic").src= url;

  /*window.freedom.emit('edit-profile', {

  });*/  
}

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

    window.freedom.emit('add-paper', {
      title: newPaper.name,
      date: today,
      key: key,
      comments: comments, 
      author: username,
      binaryString: ab2str(arrayBuffer)
    });
  }
  reader.readAsArrayBuffer(newPaper);
}

function downloadRPaper() {
  console.log("downloadrpaper");
  var ab = str2ab(currRPaper.binaryString);
  var reader = new FileReader();

  var blob = new Blob([ab], {type:'text/plain'});
  reader.readAsArrayBuffer(blob);
  saveAs(blob, currRPaper.title); 
}

function downloadVersion() {
  console.log("downlaod version");

  var ab = str2ab(currPaper.binaryString);
  var reader = new FileReader();
  var blob = new Blob([ab], {type:'application/pdf'});

  reader.readAsArrayBuffer(blob);
  saveAs(blob, currPaper.title);
}

window.freedom.on("got-review", function(data) {
  console.log("download review");

  var ab = str2ab(data.string);
  var reader = new FileReader();
  var blob = new Blob([ab], {type:'text/plain'});

  reader.readAsArrayBuffer(blob);
  console.log("data.title  " + data.title);
  saveAs(blob, data.title); 
}); 

function downloadReview(i, reviewer){ //only for text
  console.log("DOWNLOAD" + i + reviewer);
  var data; 
  if (reviewer) data = currPaper.reviews[i];
  else data = currRPaper.reviews[i];

  console.log("data " +JSON.stringify(data));
  var ab = str2ab(data.string);
  var reader = new FileReader();
  var blob = new Blob([ab], {type:'text/plain'});

  reader.readAsArrayBuffer(blob);
  console.log("data.title  " + data.name);
  saveAs(blob, data.name); 
}

function deletePaper(){
  window.freedom.emit('delete-paper', currPaper.key);
}

function makeRow(title, date, key) {
  return '<th onclick="freedom.emit(\'get-paper-view\', {key:' + key + ', vnum: -1' + '})">' + title + ' by ' + username + ' on ' + date + '</th>'; 
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

function updateReviewView(version){
  console.log("updatereviewview " + version);
  currRPaper = version;
  //console.log("VERSION " + JSON.stringify(version));
  var paper_view = document.getElementById("review-view-container");
  paper_view.getElementsByTagName("h1")[0].innerHTML = version.title + " v." + version.vnum;
  paper_view.getElementsByTagName("p")[0].innerHTML = version.comments; 

  if(version.reviews) {
   /* console.log("UPDATE REVIEW VIEW.......asdfasdfadfadfsa" + JSON.stringify(version.reviews[0])); 
    paper_view.getElementsByTagName("p")[1].innerHTML = '<a href = "#" onclick = \'downloadReview()\'>' 
    + version.reviews[0].name + '</a>'; */

    for (var i = 1; i < paper_view.getElementsByTagName("p").length; i++){
      paper_view.removeChild(paper_view.getElementsByTagName("p")[i]);
    }

    for(var i = 0; i < version.reviews.length; i++){
      //TODO: adding p elements
      var pEl = document.createElement('p');
      pEl.innerHTML = '<a href = \'#\' onclick="downloadReview(' + i +  ')">' + version.reviews[i].name + ' by ' + version.reviews[i].reviewer + ' on ' 
      + version.reviews[i].date + '</a>';
      paper_view.appendChild(pEl);
    }
  }
}

function updateView(version, action) { //get newest version of uploaded paper/paper you were looking at 
  currPaper = version; 
  var btn_group = document.getElementById("v_btn_group"); 
  btn_group.getElementsByTagName("button")[0].removeAttribute('disabled'); 
  btn_group.getElementsByTagName("button")[1].removeAttribute('disabled'); 
  if(version && typeof version === "object") document.getElementById('options-butt').removeAttribute('disabled');
  if(action >= 0) btn_group.getElementsByTagName("button")[1].setAttribute('disabled', true); 
  if(action <= 0) btn_group.getElementsByTagName("button")[0].setAttribute('disabled', true); 

  var paper_view = document.getElementById("paper-view-container");
  paper_view.getElementsByTagName("h1")[0].innerHTML = version.title + " v." + version.vnum;
  paper_view.getElementsByTagName("p")[0].innerHTML = version.comments;

  for (var i = 1; i < paper_view.getElementsByTagName("p").length; i++){
    console.log("INNER HTML: " + paper_view.getElementsByTagName("p")[i].innerHTML);
    paper_view.removeChild(paper_view.getElementsByTagName("p")[i]);
  }

  if(version.reviews) {
    for(var i = 0; i < version.reviews.length; i++){
      console.log("here");
      //TODO: adding p elements
      var pEl = document.createElement('p');
      pEl.innerHTML = '<a href = \'#\' onclick="downloadReview(' + i + ', 1)">' + version.reviews[i].name + ' by ' + version.reviews[i].reviewer + ' on ' 
      + version.reviews[i].date + '</a>';
      paper_view.appendChild(pEl);
    }
  }
}

window.freedom.on('display-delete-paper', function(key) {
  updateTable(key, -1);
  window.freedom.emit('load-papers', 0);
});

window.freedom.on('display-new-paper', function(paper) {
  updateTable(paper, 1); 
  updateView(paper.versions[0], 0); 
});

window.freedom.on('display-new-version', function(paper) {
  updateView(paper.versions[paper.versions.length-1], 1); 
});

function getVersion(offset) {
  window.freedom.emit('get-paper-view', {
    key: currPaper.key, 
    vnum: currPaper.vnum+offset 
  }); 
}

window.freedom.on("got-paper-view", function(data) {
//  console.log("IN GOT PAPER VIEW data : " + JSON.stringify(data));
  console.log("IN GOT PAPER VIEW reviews : " + JSON.stringify(data.version.reviews));
  currPaper = data.version; 
  updateView(data.version, data.action);
}); 

window.freedom.on('display-table-and-view', function(papers){
  var btn_group = document.getElementById("v_btn_group"); 
  if(papers.length == 0)  {
    document.getElementById('options-butt').setAttribute('disabled', true); 
    btn_group.getElementsByTagName("button")[0].setAttribute('disabled', true); 
    btn_group.getElementsByTagName("button")[1].setAttribute('disabled', true); 
  }
  else {
    document.getElementById('options-butt').removeAttribute('disabled');
  } 

  var paper_table = document.getElementById('paper-table');
  for (var i = paper_table.rows.length; i < papers.length; i++){
    var p = document.createElement('tr'); 
    p.setAttribute("id", papers[i].key);
    var len = papers[i].versions.length-1; 
    p.innerHTML = makeRow(papers[i].versions[len].title, papers[i].versions[len].date, papers[i].key); 
    paper_table.appendChild(p);
  }

  var paper_view = document.getElementById("paper-view-container");
  if (!papers.length) {
    paper_view.getElementsByTagName("h1")[0].innerHTML = "";
    paper_view.getElementsByTagName("p")[0].innerHTML = "";
    return;
  }

  var action = 1;
  if (papers[0].versions.length == 1) action = 0;

  var firstVersion = papers[0].versions[papers[0].versions.length-1];
  updateView(firstVersion, action); 
});

//display papers that user already interviewed
function getPastReviews() {
  var past_btn = document.getElementById("review-btns").getElementsByTagName("button")[0]; 
  var pending_btn = document.getElementById("review-btns").getElementsByTagName("button")[1]; 
  
  past_btn.className = "btn btn-default active"; 
  pending_btn.className = "btn btn-default"; 

  window.freedom.emit("get-r-papers", 0); 
}

//display papers that user was invited to review
function getPendingReviews() {
  var past_btn = document.getElementById("review-btns").getElementsByTagName("button")[0]; 
  var pending_btn = document.getElementById("review-btns").getElementsByTagName("button")[1]; 
  
  past_btn.className = "btn btn-default"; 
  pending_btn.className = "btn btn-default active"; 

  window.freedom.emit("get-r-papers", 1); //1 for pending, 0 for past
}

window.freedom.on('display-reviews', function(data) {
  console.log("DISPLAY REVIEWS papers : " + JSON.stringify(data.papers));
  var paper_table = document.getElementById('pending-r-table'); 

//deleting all
  for (var i = 0; i < paper_table.rows.length; i++){
    paper_table.removeChild(paper_table.rows[i]);
  }

  for (var i = 0; i < data.papers.length; i++){
    console.log("DAT PAPERS PENDING " + data.papers[i].pending + ", DATA PENDING " + data.pending);
    if (data.papers[i].pending === data.pending){
      console.log("DISPLAY REVIEWS in loop pending: " + data.pending);
      var p = document.createElement('tr');
      p.innerHTML = '<th onclick="freedom.emit(\'get-pending-r-view\','+ 
      '{key:' + data.papers[i].key + ', vnum : ' + data.papers[i].vnum + ', username: \'' + 
      data.papers[i].author +'\'})">' + data.papers[i].title + ' by ' + data.papers[i].author + "</th>";
      paper_table.appendChild(p);
    }
  }
});

// show the given page, hide the rest
function showPage(id) {
  console.log("show page: " + id);
    var pg = document.getElementById(id);

    // get all pages, loop through them and hide them
    var pages = document.getElementsByClassName('page');
    for(var i = 0; i < pages.length; i++) 
        pages[i].style.display = 'none';

    if(id === "papers-page") {
      window.freedom.emit('load-papers', 0);
    }
    if(id === "browse-page") {
      window.freedom.emit('load-public-storage', 0);
    }
    if(id === "alerts-page") {
      window.freedom.emit('load-alerts', 0);
    }

    if (id) pg.style.display = 'block';
}

  // Display the current status of our connection to the Social provider
window.freedom.on('recv-status', function(msg) {
  console.log("status: " + msg);
});

window.freedom.on('recv-message', function(msg) {
  var parse = JSON.parse(msg);

  if(parse.action === 'invite-reviewer') {
    var badges = document.getElementsByClassName("badge"); 
    alertNum++;
    for(var i = 0; i < badges.length; i++) {
      badges[i].innerHTML = alertNum;  
    }
  }
  else if(parse.action === 'add-review') {
    var badges = document.getElementsByClassName("badge"); 
    alertNum++;
    for(var i = 0; i < badges.length; i++) {
      badges[i].innerHTML = alertNum;  
    } 
  }
  else if (parse.action === "get-public-papers"){
    console.log("here");
    var paper_table = document.getElementById('browse-paper-table');
    var newBody = document.createElement('tbody');

    for (var i = 0; i < parse.papers.length; i++){
      var p = document.createElement('tr');
      //p.setAttribute("id", data.key);
      p.innerHTML = "<th>" + parse.papers[i].title + " by " + parse.papers[i].author + "</th>";
      newBody.appendChild(p);
    }
    paper_table.replaceChild(newBody, paper_table.childNodes[0]);
  }
  else if (parse.action === "send-r-paper"){
    console.log("got to send r paper ux");
    updateReviewView(parse.version);
  }
});

window.freedom.on('got-alerts', function(alerts){
  console.log("got-alerts");
  var badges = document.getElementsByClassName("badge"); 
  for(var i = 0; i < badges.length; i++) {
    badges[i].innerHTML = "";  
  }

  var parse = JSON.parse(alerts);
  var alerts_table = document.getElementById('alerts-table');
  var newBody = document.createElement('tbody');

  for (var i = 0; i < parse.length; i++){
    var p = document.createElement('tr');
    if (parse[i].action === "invite-reviewer"){
      p.innerHTML = "<th>You were invited to review the paper " + parse[i].title + " by " + parse[i].author + "</th>";
    }
    else if(parse[i].action === 'add-review') {
      //TODO: have key, vnum, but need title?! 
      p.innerHTML = "<th>" + parse[i].reviewer + " reviewed your paper</th>";
    }

    console.log(i + " " + alertNum); 
    if (i >= parse.length - alertNum) { 
      p.style.color = "#3CB371";    
    }

    newBody.insertBefore(p, newBody.childNodes[0]);
  }
  alerts_table.replaceChild(newBody, alerts_table.childNodes[0]);
  console.log(JSON.stringify(parse));
  alertNum = 0;

  if (parse.length === 0) alerts_table.innerHTML = "You have no new alerts.";
});

window.onload = function() {
  $("[data-toggle=tooltip]").tooltip();
  showPage();
} 