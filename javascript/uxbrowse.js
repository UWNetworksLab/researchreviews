app.controller('browseController', function($scope, $location, $modal) {
  	$scope.showNav = true; 

  	//for browse paper table
  	$scope.papers = [];
  	$scope.publicSetting = true; 

  	//for browse paper view
  	$scope.currPaper; 
  	$scope.currVnum = 1; 

	$scope.addReview = function() {
		var version = $scope.currPaper.versions[$scope.currVnum-1];
		if(version.privateSetting && version.viewList.indexOf(username) == -1) {
			alert("You do not have permission to review this paper.");
			return;
		}

		var modalInstance = $modal.open({
		  	templateUrl: '/modals/addReviewTemplate.html',
		  	windowClass:'normal',
		  	controller: addReviewCtrl,
		  	backdrop: 'static',
		  	resolve: {
		    	currReview: function() {
		    		var reviews = $scope.currPaper.versions[$scope.currVnum-1].reviews;
		    		for (var i = 0; i < reviews.length; i++){
		    			if (reviews[i].reviewer === username)
		    				return reviews[i];
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
		console.log("CURRREVIEW " + currReview);
		$scope.states = userList; 
	    $scope.selected = undefined;
	    $scope.alerts = [];
	    $scope.privacySetting;
	    $scope.privacyHeading = currReview.accessList? "public" : "private"; 

	    $scope.init = function(author) {
	    	$scope.states.splice($scope.states.indexOf(author), 1); 
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
			    ptitle: currRVersion.title
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

			//TODO: make this a method?
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
		window.freedom.emit('load-public-storage', 0)
	};

	$scope.getPublicPapers(); 

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
		console.log(JSON.stringify(paper));

		var msg = {
			title: paper.title,
			author: paper.author,
			pkey: paper.pkey,
			from: username
		};

		window.freedom.emit('get-browse-paper', msg); 
		window.freedom.on('display-browse-paper', function(paper) {
			$scope.currPaper = new Paper(paper);
			$scope.currVnum = paper.versions.length; 
			var len = paper.versions.length; 

			$scope.$apply(); 
			$scope.getReviews(); 
		}); 
	};

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
				console.log("MSG " + JSON.stringify(msg));
				window.freedom.emit('get-other-paper-review', msg);
			}
	};

	window.freedom.on('got-public-papers', function(papers) {
		$scope.papers = papers; 
		$scope.$apply(); 
		console.log(JSON.stringify($scope.papers));
	}); 

    window.freedom.on('got-paper-review', function(review){
    var version = $scope.currPaper.versions[$scope.currVnum-1];

      if(!version.reviews) version.reviews=[];
      var index = version.reviews.map(function(el) {
        return el.reviewer;
      }).indexOf(review.reviewer);
      if(index === -1) version.reviews.push(review);
      else version.reviews[index] = review; 
      $scope.$apply();
    });

	$scope.displayVersion = function(offset) {
		$scope.currVnum = $scope.currVnum + offset; 
		$scope.getReviews(); 
	}; 

	  //TODO: this should be temporary
	function str2ab(str) {
	    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
	    var bufView = new Uint8Array(buf);
	    for (var i=0, strLen=str.length; i<strLen; i++) {
	      bufView[i] = str.charCodeAt(i);
	    }
	    return buf;
	  }

	$scope.downloadVersion = function() {
		($scope.currPaper.versions[$scope.currVnum-1]).download(); 
	}; 

	window.freedom.on('send-private-papers', function(data) {
		$scope.papers = data; 
		$scope.$apply(); 
	}); 
});