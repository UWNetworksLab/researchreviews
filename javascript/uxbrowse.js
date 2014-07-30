app.controller('browseController', function($scope) {
	$scope.papers; 

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