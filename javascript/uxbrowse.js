app.controller('browseController', function($scope, $location) {
  	$scope.showNav = true; 
  	$scope.papers;
  	$scope.currBPaper;  

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
		window.freedom.emit('get-browse-paper', msg); 
		window.freedom.on('display-browse-paper', function(paper) {
			$scope.currBPaper = paper.versions[paper.versions.length-1];
			$scope.$apply(); 
		}); 
	};

	window.freedom.emit('load-public-storage', 0); 

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