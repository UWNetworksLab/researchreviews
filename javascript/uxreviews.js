app.controller('reviewsController', function($scope, $modal) {
	$scope.reviewKey; 
	$scope.reviews = {}; 
	$scope.currRPaper = {};

	window.freedom.emit('get-reviews', 1); 

	$scope.getReviewView = function(rkey){
		console.log("GET REVIEWVIEW" + rkey);
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

	window.freedom.on('recv-message', function(msg){
		if (msg.action === 'send-r-paper') {
			$scope.currRPaper = msg.version;
			$scope.$apply();
		}
	});

	$scope.getPendingReviews = function() {
		$("#pendingBtn").attr('class', "btn btn-default active"); 
  		$("#pastBtn").attr('class', "btn btn-default"); 
  		window.freedom.emit('get-reviews', 1); 
	};

	$scope.getPastReviews = function() {
		$("#pastBtn").attr('class', "btn btn-default active"); 
  		$("#pendingBtn").attr('class', "btn btn-default"); 
  		window.freedom.emit('get-reviews', 0); 
	}; 

	$scope.addReview = function() {
		var modalInstance = $modal.open({
	  	templateUrl: '/modals/addReviewTemplate.html',
	  	windowClass:'normal',
	  	controller: addReviewCtrl,
	  	backdrop: 'static'
	});
	};  

	var addReviewCtrl = function ($scope, $modalInstance) {
	  $scope.upload = function () {
	    var files = document.getElementById("addFile").files;
	    
	    if (files.length < 1) {
	      alert("No files found.");
	      return;
	    }

	    var reader = new FileReader();
	    reader.onload = function() {
	      var arrayBuffer = reader.result;
	      var today = new Date();  
/*	      var dd = today.getDate();
	      var mm = today.getMonth()+1; 
	      var yyyy = today.getFullYear();
	      today = yyyy+'-'+mm+'-'+dd; 
*/
	      /*var data = {
	        author: currRPaper.author,
	        key: currRPaper.key,
	        vnum: currRPaper.vnum,
	        string: ab2str(arrayBuffer),
	        name: files[0].name,
	        reviewer: username,
	        action: 'add-review',
	        date: today
	      };

	      window.freedom.emit('upload-review', JSON.stringify(data));*/ 
	    }
	    reader.readAsArrayBuffer(files[0]);    

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