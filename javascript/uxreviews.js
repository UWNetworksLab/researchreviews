app.controller('reviewsController', function($scope, $modal) {
	$scope.showNav = true; 

	//for reviewTable
	$scope.reviews = []; 

	//for reviewView
	$scope.currReview; 
	$scope.currRVersion = {};

	$scope.privacyHeading; 

	window.freedom.emit('get-reviews', 0); 

	window.freedom.on('update-my-review', function(data) {
		var review = JSON.parse(data); 

		$scope.reviews[review.rkey] = review;
		$scope.$apply(); 
		$scope.getReviewView(review.rkey);
	}); 

	//TODO: temporary. until storage buffer
	function str2ab(str) {
	  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
	  var bufView = new Uint8Array(buf);
	  for (var i=0, strLen=str.length; i<strLen; i++) {
	    bufView[i] = str.charCodeAt(i);
	  }
	  return buf;
	}

	$scope.downloadRPaper = function() {
		$scope.currRVersion.download();
	}; 

	$scope.getReviewView = function(rkey){
		var msg = {
			pkey: $scope.currRVersion.pkey,
			vnum: $scope.currRVersion.vnum,
			from: username,
			to: $scope.currRVersion.author,
			action: 'get-r-paper'
		};  

		window.freedom.emit('get-r-paper', msg);
	}; 


	window.freedom.on('display-saved-review', function(review) {
//		$scope.reviewText = review.text; 
		if(review.accessList === 'public') $scope.privacyHeading = "public"; 
		else $scope.privacyHeading = "private"; 
		$scope.$apply(); 
	}); 

	window.freedom.on('got-paper-review', function(review) {
		console.log("xxxx " + JSON.stringify(review));
		if(!$scope.currRVersion.reviews) $scope.currRVersion.reviews = []; 
		var index = $scope.currRVersion.reviews.map(function(el) {
		  return el.reviewer;
		}).indexOf(review.reviewer);
		if(index == -1) $scope.currRVersion.reviews.push(review); 
		$scope.$apply(); 
	});

	window.freedom.on('send-r-paper', function(msg){
		//show reviews of a paper that this reviewer is able to access
		$scope.currRVersion = new Version(msg);

		$scope.$apply(); 

		var paperReviews = $scope.currRVersion.reviews; 
		if(paperReviews)
		    for (rkey in paperReviews){
	    	 	var r_msg = {
			        pkey: $scope.currRVersion.pkey,
			        rkey: rkey, 
			        reviewer: paperReviews[rkey].reviewer,
			        vnum: paperReviews[rkey].vnum,
			        author: username
	        	};
	       	 	window.freedom.emit('get-paper-review', r_msg);
		    }	

		$scope.$apply();
	});

	$scope.getPendingReviews = function() {
		$("#pendingBtn").attr('class', "btn btn-default active"); 
  		$("#pastBtn").attr('class', "btn btn-default"); 
  		window.freedom.emit('get-reviews', 0); 
	};

	$scope.getPastReviews = function() {
		$("#pastBtn").attr('class', "btn btn-default active"); 
  		$("#pendingBtn").attr('class', "btn btn-default"); 
  		window.freedom.emit('get-reviews', 1); 
	}; 

	$scope.addReview = function() {
		var modalInstance = $modal.open({
		  	templateUrl: '/modals/addReviewTemplate.html',
		  	windowClass:'normal',
		  	controller: addReviewCtrl,
		  	backdrop: 'static',
		  	resolve: {
		    	currReview: function() {
			      	return $scope.currReview; 
	    		},
	    		reviews: function() {
	    			return $scope.reviews; 
	    		} 		
		 	}
		});
	};  

	var addReviewCtrl = function ($scope, $modalInstance, currReview, reviews) {
		$scope.states = userList; 
	    $scope.selected = undefined;
	    $scope.alerts = [];
	    $scope.privacySetting;
	    $scope.privacyHeading = currReview.accessList? "private" : "public"; 

	    $scope.init = function(author) {
	    	$scope.states.splice($scope.states.indexOf(author), 1); 
	    }; 

	    $scope.init(currReview.author); 

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
		    var today = new Date();  
		    currReview.text = $("#reviewText").val(); 
		    currReview.accessList = [];
		    currReview.date = today; 
		    currReview.reviewer = username; 

			if ($scope.privacySetting || $scope.privacySetting=='true') { //private review 
				currReview.accessList.push(username);
				currReview.accessList.push(currReview.author); 
				for(var i = 0; i < $scope.alerts.length; i++)
					currReview.accessList.push($scope.alerts[i].msg); 
			}
			else currReview.accessList = false; 

			window.freedom.emit('set-reviews', reviews);
			window.freedom.emit('save-review', currReview);
		    $modalInstance.dismiss('cancel');
	  };

	  $scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };
	};

	window.freedom.on('display-reviews', function(reviews) {
		$scope.reviews=[];
		for (var i = 0; i < reviews.length; i++){
			var review = new Review(reviews[i]);
			$scope.reviews.push(review);
		}

		if ($scope.reviews.length > 0) {
			$scope.currReview = $scope.reviews[0];
			var msg = {
				pkey: $scope.currReview.pkey,
				vnum: $scope.currReview.vnum,
				from: username,
				to: $scope.currReview.author,
				action: 'get-r-paper'
			};
			window.freedom.emit('get-r-paper', msg);
		}
		$scope.$apply();
	});
});