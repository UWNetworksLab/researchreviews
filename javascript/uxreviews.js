app.controller('reviewsController', function($scope, $modal) {
	$scope.showNav = true; 
	$scope.reviewKey; 
	$scope.reviews = {}; 
	$scope.currRPaper = {};

	window.freedom.emit('get-reviews', 0); 

	$scope.getReviewView = function(rkey){
		$scope.reviewKey = rkey;
		console.log("REVIEW KEY  " + $scope.reviewKey);
		var msg = {
			key: $scope.reviews[rkey].pkey,
			vnum: $scope.reviews[rkey].vnum,
			from: username,
			to: $scope.reviews[rkey].author,
			action: 'get-r-paper'
		};
		window.freedom.emit('get-r-paper', msg);
	}; 

	window.freedom.on('recv-message', function(msg){
		if (msg.action === 'send-r-paper') {
			$scope.currRPaper = msg.version;
			$scope.$apply();
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
	    		}
		 	}
		});
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

  //TODO: this should be temporary
  function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  }

	var addReviewCtrl = function ($scope, $modalInstance, currRPaper) {
		$scope.states = userList; 
	    $scope.selected = undefined;
	    $scope.alerts;
	    $scope.privacySetting=true;

	    $scope.selectMatch = function(selection) {
	      $scope.alerts.push({msg: selection});
	    };

	    $scope.deleteUser = function(id) {
	      $scope.alerts.splice(id, 1);
	    };

	  	$scope.upload = function () {
	    var files = document.getElementById("addFile").files;
	    
	    if (files.length < 1) {
	      alert("No files found.");
	      return;
	    }
//TODO: don't let author appear in typeahead


	    var reader = new FileReader();
	    reader.onload = function() {
		    var arrayBuffer = reader.result;
		    var today = new Date();  
		    var data = {
		    	ptitle: currRPaper.title,
		        author: currRPaper.author,
		        pkey: currRPaper.key,
		        rkey: reviewKey,
		        vnum: currRPaper.vnum,
		        string: ab2str(arrayBuffer),
		        reviewer: username,
		        action: 'add-review',
		        date: today
		    };

		if ($scope.privacySetting) {
			$scope.alerts.push(username);
			$scope.alerts.push(currRPaper.author);
			data.accessList = $scope.alerts; 
		}

		console.log("REVIEW IN UPLOAD REVIEW "+ JSON.stringify(data));
	    window.freedom.emit('upload-review', data);
	    }
	    reader.readAsArrayBuffer(file);
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