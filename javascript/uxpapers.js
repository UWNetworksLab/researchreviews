app.controller('papersController', function($scope, $modal, $location, $filter) {
  //for paperTable
  $scope.papers = [];

  $scope.showNav = true; 
  //for paperView
  $scope.currPaper;

  //for moving between versions
  $scope.currVnum = 1;

  //for looking at someone else's papers
  $scope.accessBtn = true;
  $scope.accessAddBtn = true;   

  $scope.isopen = false; 

  $scope.displayVersion = function(offset) {
    $scope.currVnum = $scope.currVnum + offset;
    $scope.showPaperView();
  }; 

  $scope.addReview = function() {
    if($location.search().username && $location.search().username !== username) { 
      //check user access before they review this paper version
      var version = $scope.papers[$scope.viewKey].versions[$scope.currVnum-1]; 
      if(version.privateSetting && version.viewList.indexOf(username) == -1){
        alert("You do not have permission to review this paper.");
        return; 
      }
    } 
    var msg = {
      ptitle: $scope.papers[$scope.viewKey].versions[$scope.currVnum-1].title,
      pkey: $scope.viewKey,
      author: $location.search().username,
      vnum: $scope.currVnum-1,
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
          $scope.papers.push(papers[key]); 
        } 
        $scope.accessAddBtn = false; 
        $scope.$apply(); 
      });
    }
    else { //load own papers
      window.freedom.emit('get-papers', 0); 
      window.freedom.on('display-papers', function(papers) {
        $scope.papers = []; 
        for(var i = 0; i < papers.length; i++) {
          for(var j = 0; j < papers[i].versions.length; j++) 
            papers[i].versions[j].date = new Date(papers[i].versions[j].date); 
          var newPaper = new Paper(papers[i]); 
          $scope.papers.push(newPaper); 
        }

        console.log("in load");
        if($scope.papers.length > 0) {
//          $scope.sortPapers('newest');
console.log("stuff in papers");
          $scope.currPaper = $scope.papers[0];
          $scope.showPaperView();
        }
        $scope.$apply(); 
      }); 
    }
  };  

  loadPapersPage(); 

  $scope.showPaperView = function(key) {
    //LOAD PAPER VIEW
    if($scope.papers.length === 0) 
      return; 
    if(!$scope.currPaper) {
      $scope.currPaper = $scope.papers[0]; 
      $scope.currVnum = $scope.papers[0].versions.length;
    }

    if(key) {
      for(var i = 0; i < $scope.papers.length; i++) 
        if($scope.papers[i].pkey === key) {
          $scope.currPaper = $scope.papers[i]; 
          break; 
        }
      }
    
    //LOAD REVIEWS
    console.log($scope.currVnum);
    var reviews = $scope.currPaper.versions[$scope.currVnum-1].reviews; 
    if(reviews)
      for(var i = 0; i < reviews.length; i++) {
        var msg = {
          pkey: $scope.currPaper.pkey,
          rkey: reviews[i].rkey,
          reviewer: reviews[i].reviewer,
          vnum: $scope.currVnum-1,
          author: $location.search().username, 
          from: username 
        };  

        if($location.search().username && $location.search().username !== username)
          window.freedom.emit('get-other-paper-review', msg);
        else
          window.freedom.emit('get-paper-review', msg); 
      }  

    if($location.search().username && $location.search().username !== username)  //load someone else's paper's reviews 
      $scope.accessBtn = false;

    window.freedom.on('got-paper-review', function(review){
      if(!reviews) reviews=[];
      var index = reviews.map(function(el) {
        return el.reviewer;
      }).indexOf(review.reviewer);
      if(index == -1) reviews.push(review);
      else reviews[index] = review; 
      $scope.currPaper.versions[$scope.currVnum-1].reviews = reviews; 
      $scope.$apply();
    });   
  }; 

  window.freedom.on('display-new-paper', function(newPaper) {
    var paper = new Paper(newPaper);
    $scope.currPaper = paper;
    $scope.papers.push($scope.currPaper); 
    $scope.$apply(); 
    $scope.showPaperView(); 

    window.freedom.emit('set-papers', $scope.papers);
  }); 

  window.freedom.on('display-new-version', function(newVersion) {
    $scope.currVnum = newVersion.vnum+1;
    $scope.showPaperView(); 
    $scope.$apply(); 

    window.freedom.emit('set-papers', $scope.papers);
  });

  $scope.addVersion = function() {
    var modalInstance = $modal.open({
      templateUrl: '/modals/addVersionTemplate.html',
      windowClass:'normal',
      controller: addVersionCtrl,
      backdrop: 'static', 
      resolve: {
        paper: function() {
          return $scope.currPaper; 
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
      resolve:{
        papers: function(){
          return $scope.papers;
        }
      }
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
              return $scope.papers[i][1].versions[$scope.currVnum-1].privateSetting; 
        },
        vnum: function() {
          return $scope.currVnum-1;  
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
          return $scope.currVnum-1;
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

  var addPaperCtrl = function ($scope, $modalInstance, papers) {
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
      if (files.length < 1) {
        alert("No files found.");
        return;
      }

      var comments = document.getElementById("add-paper-comments").value;
      var alertList = [];
      for(var i = 0; i < $scope.alerts.length; i++) 
        alertList.push($scope.alerts[i].msg); 

      var viewList;
      if(!$scope.privatePaper) { //publicly shared
        viewList = false; 
      }
      else { //privately shared
        viewList = alertList; 
        alertList = $scope.checkList; 
      }

      var newPaper = new Paper();

      var vdata = {
        comments: comments,
        viewList: viewList,
        alertList: alertList,
        privateSetting: $scope.privatePaper
      }

      newPaper.addVersion(vdata, files[0]);
      $modalInstance.dismiss('cancel');
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  };

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

  var addVersionCtrl = function ($scope, $modalInstance, paper) {
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

      if (files.length < 1) {
        alert("No files found.");
        return;
      }

      var alertList = [];
      for(var i = 0; i < $scope.alerts.length; i++) 
        alertList.push($scope.alerts[i].msg); 

      var viewList;
      if(!$scope.privatePaper) { //publicly shared
        viewList = false; 
      }
      else { //privately shared
        viewList = alertList;
        alertList = $scope.checkList; 
      }

      var vdata = {
        comments: comments,
        viewList: viewList,
        alertList: alertList,
        privateSetting: $scope.privatePaper
      };

      var newVersion = new Version(vdata, files[0], paper); 
      $modalInstance.dismiss('cancel');
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  };

  $scope.deleteVersion = function() {
    $scope.currPaper.deleteVersion(--$scope.currVnum);

    if($scope.currPaper.versions.length === 0) { //deleted last version
      for(var i = 0; i < $scope.papers.length; i++)
        if($scope.papers[i].pkey === $scope.currPaper.pkey) {
          $scope.papers.splice(i, 1); 
          break; 
        }  

      $scope.currPaper = $scope.papers.length>0? $scope.papers[0] : false; 
      if($scope.currVnum < 1) $scope.currVnum = 1; 
    }   

    console.log(JSON.stringify($scope.papers));

    window.freedom.emit('set-papers', $scope.papers);
  };

  $scope.downloadVersion = function () {
    if($location.search().username && $location.search().username !== username) { 
      //check user access before they download someone else's paper version 
      var version = $scope.papers[$scope.viewKey].versions[$scope.currVnum-1]; 
      if(version.privateSetting && version.viewList.indexOf(username) == -1){
        alert("You do not have access to this version of the paper.");
        return; 
      }
    }

    var file; 
    for(var i = 0; i < $scope.papers.length; i++) 
      if($scope.papers[i].pkey === $scope.currPaper.pkey) {
        file = $scope.papers[i].versions[$scope.currVnum-1]; 
        break; 
      }

    var ab = str2ab(file.binaryString);
    var reader = new FileReader();
    var blob = new Blob([ab], {type:'application/pdf'});

    reader.readAsArrayBuffer(blob);
    saveAs(blob, file.title);
  }

  //TODO: this should be temporary
});