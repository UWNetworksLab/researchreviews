app.controller('browseController', function($scope, $location) {
  	$scope.showNav = true; 

  	//for browse paper table
  	$scope.papers;
  	$scope.publicSetting = true; 

  	//for browse paper view
  	$scope.currBPaper; 
  	$scope.viewKey;   
  	$scope.currVersion = 1;
  	$scope.totalVersion = 1; 
  	$scope.viewTitle; 
  	$scope.viewComments; 
  	$scope.reviews; 

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
		var msg = {
			title: paper.title,
			author: paper.author,
			key: paper.key,
			from: username
		};
		$scope.viewKey = paper.key; 

		window.freedom.emit('get-browse-paper', msg); 
		window.freedom.on('display-browse-paper', function(paper) {
			$scope.currBPaper = paper;
			$scope.currVersion = paper.versions.length; 
			$scope.totalVersion = paper.versions.length; 
			var len = paper.versions.length; 

			$scope.viewTitle = paper.versions[len-1].title + " v." + len + " of " + len; 
			$scope.viewComments = paper.versions[len-1].comments; 
			$scope.$apply(); 
			if($scope.publicSetting) 
				$scope.getPublicPapers(); 
			else 
				$scope.getPrivatePapers(); 
			$scope.getReviews(); 
		}); 
	};

	$scope.getReviews = function() {
		$scope.reviews = []; 

		var paperReviews = $scope.currBPaper.versions[$scope.currVersion-1].reviews;

		if(paperReviews)
			for(var i = 0; i < paperReviews.length; i++) {
				var msg = {
					pkey: $scope.currBPaper.key,
					rkey: paperReviews[i].rkey,
					reviewer: paperReviews[i].reviewer,
					vnum: $scope.currVersion-1,
					author: $scope.currBPaper.versions[$scope.currVersion-1].author,
					from: username 
				}; 

				window.freedom.emit('get-other-paper-review', msg);
			} 
	};

	window.freedom.on('got-public-papers', function(papers) {
		$scope.papers = papers; 
		$scope.$apply(); 
		console.log(JSON.stringify($scope.papers));
	}); 

    window.freedom.on('got-paper-review', function(review){
      if(!$scope.reviews) $scope.reviews=[];
      var index = $scope.reviews.map(function(el) {
        return el.reviewer;
      }).indexOf(review.reviewer);
      if(index == -1) $scope.reviews.push(review);
      else $scope.reviews[index] = review; 
      $scope.$apply();
    });

	$scope.displayVersion = function(offset) {
		$scope.currVersion = $scope.currVersion + offset; 
		$scope.viewTitle = $scope.currBPaper.versions[$scope.currVersion-1].title + " v." + $scope.currVersion + " of " + $scope.totalVersion; 
		$scope.viewComments = $scope.currBPaper.versions[$scope.currVersion-1].comments; 

		$scope.getReviews(); 
	}; 

	$scope.addReview = function() {
		var version = $scope.currBPaper.versions[$scope.currVersion-1];
		if(version.privateSetting && version.viewList.indexOf(username) == -1) {
			alert("You do not have permission to review this paper.");
			return; 
		}
		var msg = {
			ptitle: version.title,
			pkey: $scope.viewKey,
			author: version.author,
			vnum: $scope.currVersion-1,
			rkey: Math.random() + ""
		}; 
		window.freedom.emit('add-review', msg);
		window.freedom.on('go-to-reviews', function(data) {
			$location.path('reviewspage'); 
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

	$scope.downloadVersion = function() {
		var version = $scope.currBPaper.versions[$scope.currVersion-1]; 
		if(version.privateSetting && version.viewList.indexOf(username) == -1) {
			alert("You do not have access to this version of the paper.");
			return; 
		}
	    var file = $scope.currBPaper.versions[$scope.currVersion-1]; 
	    var ab = str2ab(file.binaryString);
	    var reader = new FileReader();
	    var blob = new Blob([ab], {type:'application/pdf'});

	    reader.readAsArrayBuffer(blob);
	    saveAs(blob, file.title);
	}; 

	window.freedom.on('recv-message', function(data) {
		$scope.papers = data.papers; 
		$scope.$apply(); 
	}); 

	window.freedom.on('send-private-papers', function(data) {
		console.log(JSON.stringify(data));
		$scope.papers = data; 
		$scope.$apply(); 
	}); 
});