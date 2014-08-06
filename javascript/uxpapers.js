app.controller('papersController', function($scope, $modal, $location) {
  $scope.showNav = true; 

  //for paperTable
  $scope.papers = [];  

  //for paperView
  $scope.viewTitle = "";
  $scope.viewComments = ""; 
  $scope.viewKey; 

  //for moving between versions
  $scope.currVersion = 1;
  $scope.totalVersion = 1;
  $scope.reviews;

  //for looking at someone else's papers
  $scope.accessBtn = true;
  $scope.accessAddBtn = true;   

  $scope.isopen = false; 

  $scope.sortPapers = function(sortOpt) {
    if(sortOpt === 'title') {
      $scope.papers.sort(function(a, b) {
        a = a[1];
        b = b[1];
        a = a.versions[a.versions.length-1].title.toUpperCase(); 
        b = b.versions[b.versions.length-1].title.toUpperCase(); 
        return a < b ? -1 : (a > b ? 1 : 0);
      });
    }
    else if(sortOpt === 'oldest') {
      $scope.papers.sort(function(a, b) {
        a = a[1];
        b = b[1];
        a = a.versions[a.versions.length-1].date; 
        b = b.versions[b.versions.length-1].date; 
        return a < b ? -1 : (a > b ? 1 : 0);
      });     
    }
    else if(sortOpt === 'newest') {
      $scope.papers.sort(function(a, b) {
        a = a[1];
        b = b[1];
        a = a.versions[a.versions.length-1].date; 
        b = b.versions[b.versions.length-1].date; 
        return a > b ? -1 : (a < b ? 1 : 0);
      });
    }
  }

  $scope.displayVersion = function(offset) {
    $scope.currVersion = $scope.currVersion + offset; 
    $scope.showPaperView($scope.viewKey, $scope.currVersion);
  }; 

  $scope.addReview = function() {
    if($location.search().username && $location.search().username !== username) { 
      //check user access before they review this paper version
      var version = $scope.papers[$scope.viewKey].versions[$scope.currVersion-1]; 
      if(version.privateSetting && version.viewList.indexOf(username) == -1){
        alert("You do not have permission to review this paper.");
        return; 
      }
    } 
    var msg = {
      ptitle: $scope.papers[$scope.viewKey].versions[$scope.currVersion-1].title,
      pkey: $scope.viewKey,
      author: $location.search().username,
      vnum: $scope.currVersion-1,
      rkey: Math.random() + ""
    }; 
    window.freedom.emit('add-review', msg);
    window.freedom.on('go-to-reviews', function(data) {
      $location.path('reviewspage');  
    }); 
  }; 

  var loadPapersPage = function() {
    if($location.search().username && $location.search().username !== username) { //load someone else's papers 
      window.freedom.emit('get-other-papers', {
        to: $location.search().username, 
        from: username 
      }); 
      window.freedom.on('display-other-papers', function(papers) {
        for(var key in papers) {
          $scope.papers.push([key, papers[key]]); 
        } 
        $scope.viewTitle = "Please choose a paper.";
        $scope.viewComments = "";  
        $scope.accessAddBtn = false; 
        $scope.$apply(); 
      });
    }
    else { //load own papers
      window.freedom.emit('get-papers', 0); 
      window.freedom.on('display-papers', function(data) {
        $scope.papers = []; 
        if(Object.keys(data.papers).length > 0) {
          for(var key in data.papers) {
            for(var i = 0; i  < data.papers[key].versions.length; i++)
              data.papers[key].versions[i].date = new Date(data.papers[key].versions[i].date);  
            $scope.papers.push([key, data.papers[key]]);      
          }
        }
        if($scope.papers.length == 0)
          $scope.viewTitle = "You currently have no papers."; 

        $scope.$apply(); 

        if($scope.papers.length > 0) {
          $scope.sortPapers('newest');
          $scope.showPaperView($scope.papers[0][0]);  
        }
      }); 
    }
  };  

  loadPapersPage(); 

  $scope.showPaperView = function(key, vnum) {//TODO: get rid of vnum??
    //LOAD PAPER VIEW
    for(var i = 0; i < $scope.papers.length; i++) 
      if($scope.papers[i][0] == key) {
        if(vnum) { //from version buttons
          var len = $scope.papers[i][1].versions.length; 
          $scope.viewTitle = $scope.papers[i][1].versions[vnum-1].title + " v." + vnum + " of " + len; 
          $scope.viewComments = $scope.papers[i][1].versions[vnum-1].comments;  
          $scope.totalVersion = len; 
        }
        else { //from paper table
          $scope.viewKey = key; 
          var len = $scope.papers[i][1].versions.length; 
          $scope.viewTitle = $scope.papers[i][1].versions[len-1].title + " v." + len + " of " + len; 
          $scope.viewComments = $scope.papers[i][1].versions[len-1].comments;
          $scope.currVersion = len; 
          $scope.totalVersion = len;        
        }
        break; 
      }
    
    //LOAD REVIEWS
    
    $scope.reviews = []; 
    var paper; 
    for(var i = 0; i < $scope.papers.length; i++)
      if($scope.papers[i][0] == key) {
        paper = $scope.papers[i][1]; 
        break; 
      }

    if($location.search().username && $location.search().username !== username) { //load someone else's paper's reviews 
      $scope.accessBtn = false;

      if (paper.versions[$scope.currVersion-1].reviews){
        var paperReviews = paper.versions[$scope.currVersion-1].reviews;

        for (var i = 0; i < paperReviews.length; i++){
          var msg = {
            pkey: key,
            rkey: paperReviews[i].rkey,
            reviewer: paperReviews[i].reviewer,
            vnum: $scope.currVersion-1,
            author: $location.search().username, 
            from: username 
          };

          window.freedom.emit('get-other-paper-review', msg);
        }    
      }
    }
    else if (paper.versions[$scope.currVersion-1].reviews){
      var paperReviews = paper.versions[$scope.currVersion-1].reviews;

      for (var i = 0; i < paperReviews.length; i++){
          var msg = {
            pkey: key,
            rkey: paperReviews[i].rkey,
            reviewer: paperReviews[i].reviewer,
            vnum: $scope.currVersion-1,
            author: username
          };

          window.freedom.emit('get-paper-review', msg);
      }    
    }

    window.freedom.on('got-paper-review', function(review){
      if(!$scope.reviews) $scope.reviews=[];
      var index = $scope.reviews.map(function(el) {
        return el.reviewer;
      }).indexOf(review.reviewer);
      if(index == -1) $scope.reviews.push(review);
      else $scope.reviews[index] = review; 
      $scope.$apply();
    });

    if(!$scope.$$phase) {
      $scope.$apply(); 
    }    
  }; 

  window.freedom.on('display-delete-version', function(key) {
    $scope.viewTitle = "Your paper has been deleted.";
    $scope.viewComments = "";

    if($scope.currVersion-1 == 0) {
      for(var i = 0; i < $scope.papers.length; i++) 
        if($scope.papers[i][0] == key) {
          $scope.papers.splice(i, 1);
          break; 
        }
      
      $scope.viewKey = false; 
      $scope.currVersion = 1;
      $scope.totalVersion = 1; 
      return; 
    }

    if($scope.currVersion == $scope.totalVersion)
      $scope.totalVersion = $scope.totalVersion-1; 

    $scope.currVersion = $scope.currVersion-1; 

    if(!$scope.$$phase) {
      $scope.$apply(); 
    }

    loadPapersPage(); 
    $scope.showPaperView(key, $scope.currVersion);
  });

  window.freedom.on('display-new-paper', function(newPaper) {
    $scope.papers.push([newPaper.key, newPaper]); 
    $scope.$apply(); 
    $scope.showPaperView(newPaper.key); 
  }); 

  window.freedom.on('display-new-version', function(newVersion) {
    $scope.reviews = []; 
    for(var i = 0; i < $scope.papers.length; i++) {
      if($scope.papers[i][1].key == newVersion.key) {
        $scope.papers[i][1] = newVersion; 
        break; 
      }
    }

   // $scope.papers[newVersion.key] = newVersion; 
    $scope.showPaperView(newVersion.key); 
    $scope.$apply(); 
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
          for(var i = 0; i < $scope.papers.length; i++)
            if($scope.papers[i][0] == $scope.viewKey) 
              return $scope.papers[i][1].versions[$scope.currVersion-1].privateSetting; 
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
    $scope.privacyHeading; 

    $scope.init = function() {
      var paper; 
      //console.log(JSON.stringify(papers));
      for(var i = 0; i < papers.length; i++)
        if(papers[i][0] == key) {
          paper = papers[i][1];
          break; 
        }
      $scope.privacyHeading = paper.versions[vnum].privateSetting? "Select users to view this paper" : "Invite reviewers";  
    };

    $scope.init(); 

    $scope.selectMatch = function(selection) {
      $scope.alerts.push({msg: selection});
      $scope.selected = '';
    }; 

    $scope.deleteUser = function(id) {
      $scope.alerts.splice(id, 1);
    };

    $scope.invite = function () {
      var paper; 
      for(var i = 0; i < papers.length; i++) 
        if(papers[i][0] == key) {
          paper = papers[i][1]; 
          break; 
        }

      var msg = {
        title:  paper.versions[vnum].title,        
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

    if(paper.versions[vnum].privateSetting) {
      msg.action = 'allow-access'; 

      for(var i = 0; i < $scope.alerts.length; i++) 
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

  $scope.deleteVersion = function() {
    window.freedom.emit('delete-version', {
      key: $scope.viewKey,
      vnum: $scope.currVersion-1 
    });
  };

  $scope.downloadVersion = function () {
    if($location.search().username && $location.search().username !== username) { 
      //check user access before they download someone else's paper version 
      var version = $scope.papers[$scope.viewKey].versions[$scope.currVersion-1]; 
      if(version.privateSetting && version.viewList.indexOf(username) == -1){
        alert("You do not have access to this version of the paper.");
        return; 
      }
    }

    var file; 
    for(var i = 0; i < $scope.papers.length; i++) 
      if($scope.papers[i][0] == $scope.viewKey) {
        file = $scope.papers[i][1].versions[$scope.currVersion-1]; 
        break; 
      }

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
