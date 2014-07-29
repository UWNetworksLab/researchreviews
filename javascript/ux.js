//interactions
var app = angular.module('researcherApp', ['ngRoute', 'ui.bootstrap']);
var username;
var userList = [];
var alertNum = 0;

window.freedom.on('new-user', function(newUser){
  userList.push(newUser); //TODO: check if this works?? 
  //I think it would be better to just emit changes to userlist instead of 
  //accessing it each time we want to do something with it (in modals)
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

app.controller('alertsController', function($scope) {
  // create a message to display in our view
});

app.controller('reviewsController', function($scope) {
  // create a message to display in our view
});

app.controller('papersController', function($scope, $modal) {
  //for paperTable
  $scope.papers = {}; 

  //for paperView
  $scope.viewTitle = "";
  $scope.viewComments = ""; 
  $scope.viewKey; 

  //for moving between versions
  $scope.currVersion = 1;
  $scope.totalVersion = 1;

<<<<<<< HEAD
  $scope.downloadVersion = function() {
    var file = $scope.papers[$scope.viewKey].versions[$scope.currVersion-1]; 
    var ab = str2ab(file.binaryString);
    var reader = new FileReader();
    var blob = new Blob([ab], {type:'application/pdf'});

    reader.readAsArrayBuffer(blob);
    saveAs(blob, file.title);
  }; 

=======
  function openModal(url, controller){
    var modalInstance = $modal.open({
      templateUrl: '/modals/' + url,
      windowClass:'normal',
      controller: controller,
      backdrop: 'static', 
    });    
  }
>>>>>>> b1d7df9e60af965b152c286fdcb341bf3685ecd6
  $scope.displayVersion = function(offset) {
    $scope.currVersion = $scope.currVersion + offset; 
    $scope.showPaperView($scope.viewKey, $scope.currVersion)
  }; 

  var loadPapersPage = function() {
    window.freedom.emit('get-papers', 0); 
    window.freedom.on('display-papers', function(data) {
      (data.papers).forEach(function(paper) {
        $scope.papers[paper.key] = paper; 
      }); 
      $scope.$apply(); 
      if(data.viewKey) 
        $scope.showPaperView(data.viewKey); 
    }); 
  };  

  loadPapersPage(); 

  $scope.showPaperView = function(key, vnum) {
    var len = $scope.papers[key].versions.length;

    if(vnum) {
      $scope.viewTitle = $scope.papers[key].versions[vnum-1].title + " v." + vnum + " of " + len; 
      $scope.viewComments = $scope.papers[key].versions[vnum-1].comments;  
    }
    else {
      $scope.viewKey = key; 
      $scope.viewTitle = $scope.papers[key].versions[len-1].title + " v." + len + " of " + len; 
      $scope.viewComments = $scope.papers[key].versions[len-1].comments;  

      $scope.currVersion = len; 
      $scope.totalVersion = len; 
    }

    if(!$scope.$$phase) {
      $scope.$apply(); 
    }
  }; 

  window.freedom.on('display-new-paper', function(newPaper) {
    $scope.papers[newPaper.key] = newPaper;  
    $scope.showPaperView(newPaper.key); 
  }); 

  window.freedom.on('display-new-version', function(newVersion) {
    $scope.papers[newVersion.key] = newVersion; 
    $scope.showPaperView(newVersion.key); 
  });

  $scope.addVersion = function() {
    openModal('addVersionTemplate.html', addVersionCtrl);
  };

  $scope.addPaper = function() {
    openModal('addPaperTemplate.html', addPaperCtrl);
  };

  $scope.inviteReviewers = function() {
<<<<<<< HEAD
    window.freedom.emit('get-users', 'invite-reviewers'); 
  }; 

  window.freedom.on('send-users', function(msg) {
    if(msg.action === 'add-paper') {
      var modalInstance = $modal.open({
        templateUrl: '/pages/addPaperTemplate.html',
        windowClass:'normal',
        controller: addPaperCtrl,
        backdrop: 'static', 
        resolve: {
          userList: function () {
            return msg.userList;
          }
        }
      }); 
    }
    else if(msg.action === 'add-version') {
     var modalInstance = $modal.open({
        templateUrl: '/pages/addVersionTemplate.html',
        windowClass:'normal',
        controller: addVersionCtrl,
        backdrop: 'static', 
        resolve: {
          userList: function () {
            return msg.userList;
          }, 
          key: function() {
            return $scope.viewKey; 
          } 
        }
      });   
    }
    else if(msg.action === 'invite-reviewers') {
     var modalInstance = $modal.open({
        templateUrl: '/pages/inviteReviewersTemplate.html',
        windowClass:'normal',
        controller: inviteReviewersCtrl,
        backdrop: 'static', 
        resolve: {
          userList: function () {
            return msg.userList;
          }, 
          key: function() {
            return $scope.viewKey; 
          },
          privateSetting: function() {
            return $scope.papers[$scope.viewKey].versions[$scope.currVersion-1].privateSetting; 
          }
        }
      });   
    }
  });      
=======
    openModal('inviteReviewersTemplate.html', inviteReviewersCtrl);
  };
>>>>>>> b1d7df9e60af965b152c286fdcb341bf3685ecd6

  var addPaperCtrl = function ($scope, $modalInstance) {
    console.log("USERLIST: " + userList);
    $scope.states = userList; 
    $scope.privacyHeading = "Invite reviewers.";
    $scope.privatePaper = false;

    $scope.selected = undefined;
    $scope.alerts = [];

    $scope.checkList = []; 

    $scope.setPrivate = function(){
      $scope.privatePaper = true;
    };

    $scope.setPublic = function(){
      $scope.privatePaper = false;
    };

    $scope.deleteUser = function(id) {
      var idx = $scope.checkList.indexOf($scope.alerts[id].msg);
      if(idx > -1) 
        $scope.checkList.splice(idx, 1); 

      $scope.alerts.splice(id, 1);
    };

    $scope.selectMatch = function(selection) {
      $scope.alerts.push({msg: selection});
    };

    $scope.checkAlert = function(username) {
      var idx = $scope.checkList.indexOf(username); 

      if (idx > -1) $scope.checkList.splice(idx, 1);
      else $scope.checkList.push(username);
    }; 

    $scope.upload = function () {
      var files = document.getElementById("addFile").files;
      var comments = document.getElementById("add-paper-comments").value;

      var alertList = [];
      for(var i = 0; i < $scope.alerts.length; i++) 
        alertList.push($scope.alerts[i].msg); 

      var paper = {
        comments: comments,
        privateSetting: $scope.privatePaper 
      };

      if (files.length < 1) {
        alert("No files found.");
        return;
      }

      if(!$scope.privatePaper) { //publicly shared
        paper.viewList = false; 
        paper.alertList = alertList; 
        uploadFile(files, paper);
      }
      else { //privately shared
        paper.viewList = alertList; 
        paper.alertList = $scope.checkList; 
        uploadFile(files, paper);
      }

      $modalInstance.dismiss('cancel');
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  };

  var inviteReviewersCtrl = function ($scope, $modalInstance) {
    $scope.states = userList; 
    $scope.selected = undefined;
    $scope.alerts = [];   
    $scope.selectMatch = function(selection) {
      $scope.alerts.push({msg: selection});
      $scope.selected = '';
    }; 
    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };
    $scope.invite = function () {
      var msg = {
        title: document.getElementById("paper-view-container").getElementsByTagName("h1")[0].innerHTML,
        action: 'invite-reviewer',
        key: currPaper.key,
        author: username,
        vnum: currPaper.vnum
      };

      for(var i = 0; i < $scope.alerts.length; i++) {
        freedom.emit('send-message', {
          to: $scope.alerts[i].msg,
          msg: JSON.stringify(msg)
        });
      }
    $modalInstance.dismiss('cancel');
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  };

  var addVersionCtrl = function ($scope, $modalInstance, key) {
    $scope.states = userList; 
    $scope.privacyHeading = "Invite reviewers.";
    $scope.privatePaper = false;

    $scope.selected = undefined;
    $scope.alerts = [];

    $scope.checkList = []; 

    $scope.setPrivate = function(){
      $scope.privatePaper = true;
    };

    $scope.setPublic = function(){
      $scope.privatePaper = false;
    };

    $scope.deleteUser = function(id) {
      var idx = $scope.checkList.indexOf($scope.alerts[id].msg);
      if(idx > -1) 
        $scope.checkList.splice(idx, 1); 

      $scope.alerts.splice(id, 1);
    };

    $scope.selectMatch = function(selection) {
      $scope.alerts.push({msg: selection});
    };

    $scope.checkAlert = function(username) {
      var idx = $scope.checkList.indexOf(username); 

      if (idx > -1) $scope.checkList.splice(idx, 1);
      else $scope.checkList.push(username);
    }; 

    $scope.upload = function () {
      var files = document.getElementById("addFile").files;
      var comments = document.getElementById("add-version-comments").value;

      var alertList = [];
      for(var i = 0; i < $scope.alerts.length; i++) 
        alertList.push($scope.alerts[i].msg); 

      var paper = {
        comments: comments, 
        key: key, 
        privateSetting: $scope.privatePaper 
      };

      if (files.length < 1) {
        alert("No files found.");
        return;
      }

      if(!$scope.privatePaper) { //publicly shared
        paper.viewList = false; 
        paper.alertList = alertList; 
        uploadFile(files, paper);
      }
      else { //privately shared
        paper.viewList = alertList;
        paper.alertList = $scope.checkList; 
        uploadFile(files, paper);
      }

      $modalInstance.dismiss('cancel');
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  };

  var inviteReviewersCtrl = function ($scope, $modalInstance, userList, key, privateSetting) {
    $scope.states = userList; 
    $scope.selected = undefined;
    $scope.alerts = [];
    $scope.privacyHeading = "Invite reviewers"; 

    function init() {
      if(privateSetting)
        $scope.privacyHeading = "Select users to view this paper"; 
      else
        $scope.privacyHeading = "Invite reviewers"; 
    }

    init(); 

    $scope.selectMatch = function(selection) {
      $scope.alerts.push({msg: selection});
      $scope.selected = '';
    };
    
    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };

    $scope.invite = function () {
      var msg = {
        title: document.getElementById("paper-view-container").getElementsByTagName("h1")[0].innerHTML,
        action: 'invite-reviewer',
        key: currPaper.key,
        author: username,
        vnum: currPaper.vnum
      };

      for(var i = 0; i < $scope.alerts.length; i++) {
        freedom.emit('send-message', {
          to: $scope.alerts[i].msg,
          msg: JSON.stringify(msg)
        });
      }

      $modalInstance.dismiss('cancel');
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  };

  //TODO: eventually, we don't need these. (need to download large files)
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

  //msg is paper or version to be uploaded
  function uploadFile(files, msg) {
    var newFile = files[0];
    var reader = new FileReader();

    reader.onload = function() {
      var arrayBuffer = reader.result;
      var today = new Date();  
      var dd = today.getDate();
      var mm = today.getMonth()+1; 
      var yyyy = today.getFullYear();
      today = yyyy+'-'+mm+'-'+dd; 

      msg.title = newFile.name; 
      msg.date = today;
      msg.author = username; 
      msg.binaryString = ab2str(arrayBuffer); 

      if(msg.key)
        window.freedom.emit('add-version', msg);
      else 
        window.freedom.emit('add-paper', msg);
    }
    reader.readAsArrayBuffer(newFile);
  }
});

app.controller('browseController', function($scope) {
  // create a message to display in our view
});

app.controller('profileController', function($scope) {
  // create a message to display in our view
});

app.controller('mainController', function($scope) {
  $scope.username = "testing"; 
  // Display our own userId when we get it
  window.freedom.on('recv-uid', function(data) {
    if(data.onLogin) $scope.username = data.id; 
    username = data.id;
    userList = data.userList;
    $scope.$apply();
    //TODO: show profile page
  });
});