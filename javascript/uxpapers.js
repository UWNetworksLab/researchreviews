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

  var orderBy = $filter('orderBy');

  $scope.order = 'versions[versions.length-1].title'; 

  $scope.setOrder = function(order) {
    $scope.order = order; 
  }

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
          var newPaper = new Paper(papers[i]);
          $scope.papers.push(newPaper);
        }

        if($scope.papers.length > 0) {
          $scope.currPaper = $scope.papers[0];
          $scope.showPaperView();
        }
        $scope.$apply(); 

//        console.log(JSON.stringify($scope.papers));
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
    getReviews();
 }; 

  var getReviews = function(currPaper){
 // $scope.$apply();
  if(currPaper) $scope.currPaper = currPaper;
//  console.log("get reviews..." + JSON.stringify($scope.currPaper));
  var reviews = $scope.currPaper.versions[$scope.currVnum-1].reviews; 

    if(reviews)
      for(var i = 0; i < reviews.length; i++) {
        var msg = {
          pkey: $scope.currPaper.pkey,
          rkey: reviews[i].rkey,
          reviewer: reviews[i].reviewer,
          vnum: $scope.currVnum-1,
          from: username 
        };  

        msg.author = $location.search().username? $location.search().username : username;
        if($location.search().username && $location.search().username !== username) 
          window.freedom.emit('get-other-paper-review', msg);
        else 
          window.freedom.emit('get-paper-review', msg); 
      }
    if($location.search().username && $location.search().username !== username)  //load someone else's paper's reviews 
      $scope.accessBtn = false;
    window.freedom.on('got-paper-review', function(review){
      var version = $scope.currPaper.versions[$scope.currVnum-1];
      if(!version.reviews) version.reviews=[];
      for (var i = 0; i < version.reviews.length; i++){
        if (version.reviews[i].reviewer === review.reviewer){
          version.reviews[i] = review; 
          break;
        }
      }
      $scope.$apply();
    });   
 
  }

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
        },
        currPaper: function(){
          return $scope.currPaper;
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
        currPaper: function() {
          return $scope.currPaper;
        },
        vnum: function() {
          return $scope.currVnum-1;  
        },
        papers: function(){
          return $scope.papers;
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
        currPaper : function() {
          return $scope.currPaper;
        },
        vnum :function() {
          return $scope.currVnum-1;
        }
      }
    }); 
  };

  var editPrivacyCtrl = function ($scope, $modalInstance, currPaper, vnum, papers) {
    var privateSetting = currPaper.versions[vnum].privateSetting;
    console.log("PRIVATE SETTING " + privateSetting);
    $scope.currSetting = privateSetting? "private" : "public"; 
    console.log("PRIVATE public  " + $scope.currSetting);
    $scope.save = function () { 
      if($("#addPaperPublic2").is(':checked')){
        currPaper.versions[vnum].editPrivacy(true);
      window.freedom.emit('set-papers', papers);
      }
      else if($('#addPaperPrivate2').is(':checked')) { //public to private  && !privateSetting
        currPaper.versions[vnum].editPrivacy(false);
      window.freedom.emit('set-papers', papers);
      }
//      else $modalInstance.dismiss('cancel');

      $modalInstance.dismiss('cancel');
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  };

  var addPaperCtrl = function ($scope, $modalInstance, papers, currPaper) {
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
       currPaper = newPaper;
      
      var vdata = {
        vnum: 0,
        pkey: newPaper.pkey,
        ptitle: files[0].name,
        author: username,
        comments: comments,
        viewList: viewList,
        alertList: alertList,
        privateSetting: $scope.privatePaper, 
      };

      var ver = new Version(vdata);
      ver.uploadPDF(files[0]);

      newPaper.addVersion(ver);
      papers.push(currPaper);  
      //ver.shareVersion();
      window.freedom.emit('set-papers', papers);
     
       getReviews(currPaper);
      $modalInstance.dismiss('cancel');
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  };

  var inviteReviewersCtrl = function ($scope, $modalInstance, currPaper, vnum) {
    $scope.states = userList; 
    $scope.selected = undefined;
    $scope.alerts = [];   
    $scope.privacyHeading = currPaper.versions[vnum].privateSetting? "Select users to view this paper" : "Invite reviewers";  

    $scope.selectMatch = function(selection) {
      $scope.alerts.push({msg: selection});
      $scope.selected = '';
    }; 

    $scope.deleteUser = function(id) {
      $scope.alerts.splice(id, 1);
    };

    $scope.invite = function () {
      var msg = {
        title: currPaper.versions[vnum].title,        
        action: 'invite-reviewer',
        pkey: currPaper.pkey,
        author: username,
        vnum: vnum
      };

      for(var i = 0; i < $scope.alerts.length; i++) {
        freedom.emit('send-message', {
          to: $scope.alerts[i].msg,
          msg: JSON.stringify(msg)
        });
      }

    if(currPaper.versions[vnum].privateSetting) {
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

console.log("MAKING A NEW VERSION");
      var ver = new Version(vdata, paper);
      ver.uploadPDF(files[0]);
      console.log("HERE" + JSON.stringify(vdata));
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

    $scope.currPaper.versions[$scope.currVnum-1].download();
  }
});
