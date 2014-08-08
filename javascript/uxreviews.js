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
//		$scope.reviewText = review.text; 
		if(review.accessList === 'public') $scope.privacyHeading = "public"; 
		else $scope.privacyHeading = "private"; 
		$scope.$apply(); 
	}); 

	window.freedom.on('got-paper-review', function(review) {
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

		var paperReviews = $scope.currRVersion.reviews; 
		if(paperReviews)
		    for (var i = 0; i < paperReviews.length; i++){
	    	 	var r_msg = {
			        pkey: $scope.currRVersion.key,
			        rkey: paperReviews[i].rkey,
			        reviewer: paperReviews[i].reviewer,
			        vnum: paperReviews[i].vnum,
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
		    	currRVersion: function() {
			      	return $scope.currRVersion; 
	    		},
	    		reviewKey: function(){
	    			return $scope.reviewKey;
	    		},
	    		reviewText: function(){
	    			return $scope.reviewText;
	    		}, 
	    		privacyHeading: function(){
	    			return $scope.privacyHeading;
	    		}	    		
		 	}
		});
	};  

	var addReviewCtrl = function ($scope, $modalInstance, currRVersion, reviewKey, reviewText, privacyHeading) {
		$scope.states = userList; 
	    $scope.selected = undefined;
	    $scope.alerts = [];
	    $scope.privacySetting;
	    $scope.reviewText = reviewText;
	    $scope.privacyHeading = privacyHeading; 

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
		    var today = new Date();  
		    var data = {
		    	ptitle: currRVersion.title,
		        author: currRVersion.author,
		        pkey: currRVersion.key,
		        rkey: reviewKey,
		        vnum: currRVersion.vnum,
		        text: $("#reviewText").val(),
		        reviewer: username,
		        action: 'add-review',
		        date: today, 
		        accessList: [] 
		    };

			if ($scope.privacySetting || $scope.privacySetting=='true') {
				data.accessList.push(username);
				data.accessList.push(currRVersion.author); 
				for(var i = 0; i < $scope.alerts.length; i++)
					data.accessList.push($scope.alerts[i].msg); 
				window.freedom.emit('upload-review', data);
			}
			else {
				data.accessList = "public"; 
				window.freedom.emit('upload-review', data);
			}
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