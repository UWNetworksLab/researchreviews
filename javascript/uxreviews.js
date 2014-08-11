app.controller('reviewsController', function($scope, $modal) {
	$scope.showNav = true; 
	$scope.reviews = []; 

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
		for (var i = 0; i < $scope.reviews.length; i++){
			if ($scope.reviews[i].rkey === rkey){
				$scope.currReview = $scope.reviews[i];
				break;
			}
		}

		var msg = {
			pkey: $scope.currReview.pkey,
			vnum: $scope.currReview.vnum,
			from: username,
			to: $scope.currReview.author,
			action: 'get-r-paper'
		};
		window.freedom.emit('get-r-paper', msg);
	}; 

	window.freedom.on('display-saved-review', function(review) {
		if(review.accessList === 'public') $scope.privacyHeading = "public"; 
		else $scope.privacyHeading = "private"; 
		$scope.$apply(); 
	}); 

	window.freedom.on('got-paper-review', function(review) {
		console.log("CURR REVIEWS "+ JSON.stringify($scope.currRVersion.reviews));
		console.log("got a paper review " + JSON.stringify(review));
		if(!$scope.currRVersion.reviews) $scope.currRVersion.reviews = []; 
		
		for (var i = 0; i < $scope.currRVersion.reviews.length; i++){
			if ($scope.currRVersion.reviews[i].reviewer === review.reviewer){
				$scope.currRVersion.reviews[i] = review; 
			}
		}
		
		$scope.$apply(); 
	});

	window.freedom.on('send-r-paper', function(msg){
		//show reviews of a paper that this reviewer is able to access
		$scope.currRVersion = new Version(msg);

		$scope.$apply(); 

		var paperReviews = $scope.currRVersion.reviews; 
		console.log("send r paper" + JSON.stringify(msg));
		console.log("paper reviews..." + JSON.stringify(paperReviews));
		if(paperReviews)
		    for (var i = 0; i < paperReviews.length; i++){
	    	 	var r_msg = {
			        pkey: $scope.currRVersion.pkey, //
			        rkey: paperReviews[i].rkey,
			        reviewer: paperReviews[i].reviewer,//
			        vnum: paperReviews[i].vnum,
			        author: $scope.currRVersion.author,
			        from: username
	        	};
	        	console.log(JSON.stringify(r_msg));
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
	    		reviews: function(){
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
	    $scope.privacyHeading = currReview.accessList? "public" : "private"; 

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
		    currReview.date = today; 
		    currReview.accessList = []; 

			if ($scope.privacySetting) {
				currReview.accessList.push(username);
				currReview.accessList.push(currRVersion.author); 
				for(var i = 0; i < $scope.alerts.length; i++)
					currReview.accessList.push($scope.alerts[i].msg); 
			}
			else currReview.accessList = false; 
			window.freedom.emit('upload-review', currReview);
			window.freedom.emit('set-reviews', reviews);
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