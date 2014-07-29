app.controller('reviewsController', function($scope, $modal) {
	$scope.reviewKey; 

	$scope.getPendingReviews = function() {
		console.log("get pending");
		$("#pendingBtn").attr('class', "btn btn-default active"); 
  		$("#pastBtn").attr('class', "btn btn-default"); 
	};

	$scope.getPastReviews = function() {
		console.log("get past");
		$("#pastBtn").attr('class', "btn btn-default active"); 
  		$("#pendingBtn").attr('class', "btn btn-default"); 
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
	      var dd = today.getDate();
	      var mm = today.getMonth()+1; 
	      var yyyy = today.getFullYear();
	      today = yyyy+'-'+mm+'-'+dd; 

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

});