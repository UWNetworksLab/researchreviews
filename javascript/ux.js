//interactions
var app = angular.module('researcherApp', ['ngRoute', 'ui.bootstrap']);
var username; 
var alertNum = 0;

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

  $scope.showPaperView = function(key) {
    var len = $scope.papers[key].versions.length;

    $scope.viewKey = key; 
    $scope.viewTitle = $scope.papers[key].versions[len-1].title + " v." + len + " of " + len; 
    $scope.viewComments = $scope.papers[key].versions[len-1].comments;  

    $scope.currVersion = len; 
    $scope.totalVersion = len; 

    if(!$scope.$$phase) {
      $scope.$apply(); 
    }

    console.log($scope.viewKey);
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
    window.freedom.emit('get-users', 'add-version')
  };

  $scope.addPaper = function() {
    window.freedom.emit('get-users', 'add-paper'); 
  };

  window.freedom.on('send-users', function(msg) {
<<<<<<< HEAD
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
=======
    var templateUrl = ""; 
    if(msg.action === 'add-paper') 
      templateUrl = '/modals/addPaperTemplate.html'; 
    else if(msg.action === 'add-version')
      templateUrl = '/modals/addVersionTemplate.html'; 

    var modalInstance = $modal.open({
      templateUrl: templateUrl,
      windowClass:'normal',
      controller: addPaperCtrl,
      backdrop: 'static', 
      resolve: {
        userList: function () {
          return msg.userList;
>>>>>>> 82590e1813bcb88cd49b383972910d1885cf324c
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
  });      

  var addPaperCtrl = function ($scope, $modalInstance, userList) {
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
        comments: comments
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

  var addVersionCtrl = function ($scope, $modalInstance, userList, key) {
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
        key: key 
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

  function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
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
  $scope.username_fixed = "testing"; 
  $scope.username = "testing"; 

  // Display our own userId when we get it
  window.freedom.on('recv-uid', function(data) {
    if(data.onLogin)
      $scope.username_fixed = data.id; 
    $scope.username = data.id; 
    username = data.id; 
    $scope.$apply();

    //show profile page
  });
});