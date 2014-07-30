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

  $scope.displayVersion = function(offset) {
    $scope.currVersion = $scope.currVersion + offset; 
    $scope.showPaperView($scope.viewKey, $scope.currVersion)
  }; 

  var loadPapersPage = function() {
    window.freedom.emit('get-papers', 0); 
    window.freedom.on('display-papers', function(data) {
      if(Object.keys(data.papers).length > 0) {
        for(var key in data.papers) {
          $scope.papers[key] = data.papers[key]; 
        }
      }
      $scope.$apply(); 
    }); 
    $scope.viewTitle = "Please choose a paper.";
    $scope.viewComments = ""; 
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

  window.freedom.on('display-delete-paper', function(key) {
    delete $scope.papers[$scope.viewKey];
    $scope.viewTitle = "Paper deleted.";
    $scope.viewComments = "";
    $scope.currVersion = 1;
    $scope.totalVersion = 1;
    $scope.viewKey = false;

    if(!$scope.$$phase) {
      $scope.$apply(); 
    }
  });

  window.freedom.on('display-new-paper', function(newPaper) {
    $scope.papers[newPaper.key] = newPaper;  
    $scope.showPaperView(newPaper.key); 
  }); 

  window.freedom.on('display-new-version', function(newVersion) {
    $scope.papers[newVersion.key] = newVersion; 
    $scope.showPaperView(newVersion.key); 
  });

  $scope.addVersion = function() {
    var modalInstance = $modal.open({
      templateUrl: '/modals/addVersionTemplate.html',
      windowClass:'normal',
      controller: addVersionCtrl,
      backdrop: 'static', 
      resolve: {
        key: function() {
          return $scope.viewKey; 
        } 
      }
    }); 
  };

  $scope.addPaper = function() {
    var modalInstance = $modal.open({
      templateUrl: '/modals/addPaperTemplate.html',
      windowClass:'normal',
      controller: addPaperCtrl,
      backdrop: 'static', 
    }); 
  };

  $scope.editPrivacy = function() {
    var modalInstance = $modal.open({
      templateUrl: '/modals/editPrivacyTemplate.html',
      windowClass:'normal',
      controller: editPrivacyCtrl,
      backdrop: 'static', 
      resolve: {
        key: function() {
          return $scope.viewKey; 
        },
        privateSetting: function() {
          return $scope.papers[$scope.viewKey].versions[$scope.currVersion-1].privateSetting; 
        },
        vnum: function() {
          return $scope.currVersion-1;  
        }
      }
    });   
  }

  $scope.inviteReviewers = function() {
    var modalInstance = $modal.open({
      templateUrl: '/modals/inviteReviewersTemplate.html',
      windowClass:'normal',
      controller: inviteReviewersCtrl,
      backdrop: 'static', 
      resolve: {
        key: function() {
          return $scope.viewKey; 
        },
        papers : function() {
          return $scope.papers;
        },
        vnum :function() {
          return $scope.currVersion-1;
        }
      }
    }); 
  };

  var editPrivacyCtrl = function ($scope, $modalInstance, key, vnum, privateSetting) {
    $scope.currSetting = privateSetting? "private" : "public"; 

    $scope.save = function () { 
      var msg = {
        key: key, 
        vnum: vnum
      }; 

      if($("#addPaperPublic2").is(':checked') && privateSetting) { //private to public
        msg.action = "toPublic"; 
        window.freedom.emit('edit-privacy', JSON.stringify(msg));
      }
      else if($('#addPaperPrivate2').is(':checked') && !privateSetting) { //public to private
        msg.action = "toPrivate"; 
        window.freedom.emit('edit-privacy', JSON.stringify(msg));
      }

      $modalInstance.dismiss('cancel');
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  };

  var addPaperCtrl = function ($scope, $modalInstance) {
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

//TODO: variables like $scope.viewKey??

  var inviteReviewersCtrl = function ($scope, $modalInstance, key, papers, vnum) {
    $scope.states = userList; 
    $scope.selected = undefined;
    $scope.alerts = [];   
    $scope.privacyHeading = papers[key].versions[vnum].privateSetting ? "Select users to view this paper" : "Invite reviewers";  

    $scope.selectMatch = function(selection) {
      $scope.alerts.push({msg: selection});
      $scope.selected = '';
    }; 

    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };

    $scope.invite = function () {
      var msg = {
        title: papers[key].versions[vnum].title,        
        action: 'invite-reviewer',
        key: key,
        author: username,
        vnum: vnum
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

  $scope.deletePaper = function() {
    console.log("deletePaPER");
    window.freedom.emit('delete-paper', $scope.viewKey);
  };
  $scope.downloadVersion = function () {
    console.log("HERE");
    var file = $scope.papers[$scope.viewKey].versions[$scope.currVersion-1]; 
    var ab = str2ab(file.binaryString);
    var reader = new FileReader();
    var blob = new Blob([ab], {type:'application/pdf'});

    reader.readAsArrayBuffer(blob);
    saveAs(blob, file.title);
  }

  //TODO: this should be temporary
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
