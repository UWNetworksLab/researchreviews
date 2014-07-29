app.controller('reviewsController', function($scope, $modal) {
	$scope.reviewKey; 
	$scope.reviews = {}; 

	window.freedom.emit('get-reviews', 1); 

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


	 /* for (var x = 0; x < papers.length; x++){
	    paper_table = papers[x];
	    //deleting all
	    console.log("DATA PAPERS LENGTH " + data.papers.length);
	    for (var i = paper_table.rows.length - 1; i >=0 ; i--){
	      paper_table.removeChild(paper_table.rows[i]);
	    }
	    for (var i = 0; i < data.papers.length; i++){
	        var p = document.createElement('tr');
	        p.innerHTML = '<th onclick="freedom.emit(\'get-pending-r-view\','+ 
	        '{key:' + data.papers[i].key + ', vnum : ' + data.papers[i].vnum + ', username: \'' + 
	        data.papers[i].author +'\'})">' + data.papers[i].title + ' by ' + data.papers[i].author + "</th>";
	        paper_table.appendChild(p);
	    }

	    if (data.papers.length){
	      window.freedom.emit('get-pending-r-view', {
	        key : data.papers[0].key,
	        vnum: data.papers[0].vnum,
	        username: data.papers[0].author
	      });
	    }
	    else {
	      updateReviewView();
	    }    
	  }*/ 
	});
});