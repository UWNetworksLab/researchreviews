app.controller('reviewsController', function($scope, $modal) {
	$scope.showNav = true; 
	$scope.reviews = {}; 

	//for review view 
	$scope.reviewKey; 
	$scope.currRPaper = {};
	$scope.currPaperReviews; 

	window.freedom.emit('get-reviews', 0); 

	$scope.getReviewView = function(rkey){
		$scope.reviewKey = rkey;

		var msg = {
			key: $scope.reviews[rkey].pkey,
			vnum: $scope.reviews[rkey].vnum,
			from: username,
			to: $scope.reviews[rkey].author,
			action: 'get-r-paper'
		};
		window.freedom.emit('get-r-paper', msg);
	}; 

	window.freedom.on('got-paper-review', function(review) {
		console.log("xxxxxx" + JSON.stringify(review));

		if(!$scope.currPaperReviews) $scope.currPaperReviews = []; 
		var index = $scope.currPaperReviews.map(function(el) {
		  return el.reviewer;
		}).indexOf(review.reviewer);
		if(index == -1) $scope.currPaperReviews.push(review); 
		$scope.$apply(); 
	});

	window.freedom.on('recv-message', function(msg){
		//show reviews of a paper that this reviewer is able to access
		if (msg.action === 'send-r-paper') {
			$scope.currRPaper = msg.version;
			$scope.$apply();

			var paperReviews = $scope.currRPaper.reviews; 
			if(paperReviews)
			    for (var i = 0; i < paperReviews.length; i++) 
			    	if(paperReviews[i].accessList.indexOf(username) != -1 || paperReviews[i].accessList === 'public') {
			    	 	var r_msg = {
					        pkey: $scope.currRPaper.key,
					        rkey: paperReviews[i].rkey,
					        reviewer: paperReviews[i].reviewer,
					        vnum: paperReviews[i].vnum,
					        author: username
			        	};
			       	 	window.freedom.emit('get-paper-review', r_msg);
			    	}
		}
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
		    	currRPaper: function() {
			      	return $scope.currRPaper; 
	    		},
	    		reviewKey: function(){
	    			return $scope.reviewKey;
	    		}
		 	}
		});
	};  

	var addReviewCtrl = function ($scope, $modalInstance, currRPaper, reviewKey) {
		$scope.states = userList; 
	    $scope.selected = undefined;
	    $scope.alerts = [];
	    $scope.privacySetting='true';

	    $scope.init = function(author) {
	    	$scope.states.splice($scope.states.indexOf(author), 1); 
	    	$("#radio1").attr('checked', true); 

	    	//go through currRPaper reviews and add default text to reviewText
	    }; 

	    $scope.init(currRPaper.author); 

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
		    	ptitle: currRPaper.title,
		        author: currRPaper.author,
		        pkey: currRPaper.key,
		        rkey: reviewKey,
		        vnum: currRPaper.vnum,
		        text: $("#reviewText").val(),
		        reviewer: username,
		        action: 'add-review',
		        date: today, 
		        accessList: [] 
		    };

			if ($scope.privacySetting || $scope.privacySetting=='true') {
				data.accessList.push(username);
				data.accessList.push(currRPaper.author); 
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

	window.freedom.on('display-reviews', function(data) {
		$scope.reviews = data.reviews;
		$scope.$apply();
	});
});