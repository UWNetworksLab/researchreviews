app.controller('browseController', function($scope, $location, $modal) {
  	$scope.showNav = true; 

  	//for browse paper table
  	$scope.papers = [];
  	$scope.publicSetting = true; 

  	//for browse paper view
  	$scope.currPaper; 
  	$scope.currVnum = 1; 
$('table').on('click','tr',function(e){
  $('table').find('tr.info').removeClass('info');
  $(this).addClass('info');
});

	$scope.addReview = function() {
		var modalInstance = $modal.open({
		  	templateUrl: '/modals/addReviewTemplate.html',
		  	windowClass:'normal',
		  	controller: addReviewCtrl,
		  	backdrop: 'static',
		  	resolve: {
		    	currReview: function() {
		    		var reviews = $scope.currPaper.versions[$scope.currVnum-1].reviews;
		    		for (var i = 0; i < reviews.length; i++){
		    			if (reviews[i].reviewer === username) {
		    				return reviews[i];
		    			}
		    		}
		    		return false;
	    		},
	    		currRVersion: function() {
	    			return $scope.currPaper.versions[$scope.currVnum-1];
	    		}
		 	}
		});
	};  

	var addReviewCtrl = function ($scope, $modalInstance, currReview, currRVersion) {
		$scope.states = userList; 
	    $scope.selected = undefined;
	    $scope.alerts = [];
	    $scope.privacySetting;
	   	$scope.privacyHeading = (currReview.accessList || (typeof currReview.accessList !== 'undefined'))? "private" : "public"; 
	    $scope.currReview = currReview; 

	    $scope.init = function(author) {
	    	$scope.states.splice($scope.states.indexOf(author), 1); 
	    	console.log("ACCESS LIST: " + currReview.accessList);
	    }; 

	    $scope.init(currRVersion.author); 

	    $scope.selectMatch = function(selection) {
	      $scope.alerts.push({msg: selection});
	    };

	    $scope.deleteUser = function(id) {
	      $scope.alerts.splice(id, 1);
	    };

	    $scope.setPrivate = function() {
	    	$scope.privacySetting = true;
	    };

	    $scope.setPublic = function() {
	    	$scope.privacySetting = false; 
	    };

	  	$scope.upload = function () {
	  		//TODO: access list, information
	  		var review = {
			    date: new Date(),  
			    text: $("#reviewText").val(), 
			    accessList: [],
			    pkey: currRVersion.pkey,
			    reviewer: username,
			    vnum: currRVersion.vnum,
			    author: currRVersion.author,
			    title: currRVersion.title,
          		rkey: currReview.rkey
	  		};
        
	  		if (!currReview){
				review.rkey = Math.random() + "";	  			
	  		}

			if ($scope.privacySetting) {
				review.accessList.push(username);
				review.accessList.push(currRVersion.author); 
				for(var i = 0; i < $scope.alerts.length; i++)
					review.accessList.push($scope.alerts[i].msg);
			}
			else review.accessList = false; 

			var newReview = new Review(review);

			if(!currReview)
				currRVersion.reviews.push(newReview); 
			else 
		    	for(var i = 0; i < currRVersion.reviews.length; i++) 
		    		if(currRVersion.reviews[i].reviewer === username) 
		    			currRVersion.reviews[i] = newReview; 

			window.freedom.emit('upload-review', newReview);
			window.freedom.emit('set-review', newReview);
		    $modalInstance.dismiss('cancel'); 
	  };

	  $scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };
	};

	$scope.getPublicPapers = function() {
		$("#publicBtn").attr('class', "btn btn-default active"); 
  		$("#privateBtn").attr('class', "btn btn-default"); 	

  		$scope.publicSetting = true;
      	console.log("get public papers");
		window.freedom.emit('load-public-storage');
	};

	$scope.getPublicPapers();
 	if ($scope.papers.length > 0) $('table').children('tr:first').addClass('info');

	$scope.getPrivatePapers = function() {
		$("#privateBtn").attr('class', "btn btn-default active"); 
  		$("#publicBtn").attr('class', "btn btn-default");   

  		$scope.publicSetting = false; 
		window.freedom.emit('load-private-papers', 0) 
	}; 

	$scope.getProfile = function(username) {
		$location.path('profilepage').search({'username' : username}); 
	};

	$scope.getPaper = function(paper) {
		var msg = {
			title: paper.title,
			author: paper.author,
			pkey: paper.pkey,
			from: username
		};

		window.freedom.emit('get-browse-paper', msg); 
	};
  
  window.freedom.on('display-browse-paper', function(paper) {      
    if(paper==undefined) {
     alert("Sorry this user is currently unresponsive.");
     return; 
    }

	$scope.currPaper = new Paper(paper);
	$scope.currVnum = paper.versions.length; 
	var len = paper.versions.length; 

	$scope.$apply(); 
	if (paper.versions[paper.versions.length-1]) $scope.getReviews(); 
	}); 

	$scope.getReviews = function() {
		var paperReviews = $scope.currPaper.versions[$scope.currVnum-1].reviews;

		if(paperReviews)
			for(var i = 0; i < paperReviews.length; i++) {
				var msg = {
					pkey: $scope.currPaper.key,
					rkey: paperReviews[i].rkey,
					reviewer: paperReviews[i].reviewer,
					vnum: $scope.currVnum-1,
					author: $scope.currPaper.versions[$scope.currVnum-1].author,
					from: username 
				}; 
				window.freedom.emit('get-other-paper-review', msg);
			}
	};

	window.freedom.on('got-public-papers', function(papers) {
		$scope.papers = papers;
 if ($scope.papers.length > 0) $('table').children('tr:first').addClass('info');


	  	console.log("public papers " + JSON.stringify(papers));
  		$scope.$apply(); 
	}); 

    window.freedom.on('got-paper-review', function(review){
    var version = $scope.currPaper.versions[$scope.currVnum-1];

      if(!version.reviews) version.reviews=[];
      var index = version.reviews.map(function(el) {
        return el.reviewer;
      }).indexOf(review.reviewer);
      if(index === -1) version.reviews.push(review);
      else version.reviews[index] = review;
      console.log("GOT PAPER REVIEW " + JSON.stringify(review));
      $scope.$apply();
    });

	$scope.displayVersion = function(offset) {
		$scope.currVnum = $scope.currVnum + offset;
    if ($scope.currPaper.versions[$scope.currVnum-1]) $scope.getReviews(); 
	}; 

	$scope.downloadVersion = function() {
		($scope.currPaper.versions[$scope.currVnum-1]).download(); 
	}; 

	window.freedom.on('send-private-papers', function(data) {
		$scope.papers = data;
     if ($scope.papers.length > 0) $('table').children('tr:first').addClass('info');

    console.log("sendprivate papersi mo" + JSON.stringify(data));
		$scope.$apply(); 
	}); 
});
