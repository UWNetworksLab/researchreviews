app.controller('profileController', function($scope, $modal, $location) {
  	$scope.description = "No description added yet."; 
  	$scope.papers; 
  	$scope.reviews; 
  	$scope.showNav = true; 
  	$scope.ownProfile = true; 

  	$scope.groups = [{
	  		name: "class1",
	  		users: ["a", "b", "c"] 
  		}, 
  		{
  			name: "class2",
  			users: ["d", "e"]
  		}, 
  		{
  			name: "class3",
  			users: "s"
  		}
  	];

  	$scope.init = function() {
  		if($location.search().username && $location.search().username !== username) { //load someone else's profile
  			$scope.ownProfile = $location.search().username; 
  			window.freedom.emit('load-profile', $location.search().username);  
  			window.freedom.emit('get-other-reviews', {
  				to: $location.search().username, 
  				from: username 
  			}); 

  			window.freedom.emit('get-other-papers', {
  				to: $location.search().username, 
  				from: username 
  			}); 
  		}
  		else { //load own profile
  		  	$scope.ownProfile = true; 
  		  	window.freedom.emit('load-profile', username);
  		  	window.freedom.emit('get-papers', 0);
  			window.freedom.emit('get-reviews', 1);
  		}
  	};

  	$scope.init(); 

  	$scope.displayDetailedPapers = function() {//problem here????
  		if($scope.ownProfile == true) $scope.changeView('paperspage');
  		else if($scope.ownProfile != true) $location.path('paperspage').search({username: $scope.ownProfile});	
  	}; 

  	$scope.displayDetailedReviews = function() {
  		if($scope.ownProfile == true) $scope.changeView('reviewspage');
  		else if($scope.ownProfile != true) $location.path('reviewspage').search({username: $scope.ownProfile}); 	
  	}; 

  	window.freedom.on('display-other-reviews', function(reviews) {
  		$scope.ownProfile = $location.search().username; 
  		for(var key in reviews)
  			reviews[key].date = new Date(reviews[key].date);
  		$scope.reviews = reviews;
  		$scope.$apply(); 
  	}); 

  	window.freedom.on('display-other-papers', function(papers) {
  		$scope.ownProfile = $location.search().username; 
  		for(var key in papers) 
  			for(var i = 0; i < papers[key].versions.length; i++)
  				papers[key].versions[i].date = new Date(papers[key].versions[i].date); 
  		
  		$scope.papers = papers;
  		$scope.$apply(); 
  	}); 

	window.freedom.on('display-profile', function(data) {
	  if((data.string === "" || data.string === undefined) && data.description === "") {
	    $("#profile_pic").attr('src', "square.png"); 
	    return; 
	  }

	  var ab = str2ab(data.string);
	  var blob = new Blob([ab], {type:'image/*'});

	  $scope.description = data.description; 
	  var url = window.URL.createObjectURL(blob);
	  $("#profile_pic").attr('src', url);
	  $scope.$apply(); 
	});

	window.freedom.on('display-papers', function(papers) {
		for(var i = 0; i < papers.length; i++) {
			for(var j = 0; j < papers[i].versions.length; j++)
				papers[i].versions[j].date = new Date(papers[i].versions[j].date); 
		}
		$scope.papers = papers; 
		$scope.$apply(); 
	}); 

	window.freedom.on('display-reviews', function(reviews) {
		for(var i = 0; i < reviews.length; i++) 
			reviews[i].date = new Date(reviews[i].date); 		
		$scope.reviews = reviews;
		$scope.$apply(); 
	});

	$scope.changeView = function(view){
		$location.path(view);  
	};

	$scope.editGroups = function() {
		if($scope.ownProfile != true) {
			alert("You don't have permission to edit these groups.");
			return; 
		}

		var modalInstance = $modal.open({
		  templateUrl: '/modals/editGroupsTemplate.html',
		  windowClass:'normal',
		  controller: editGroupsCtrl,
		  backdrop: 'static', 
		  resolve: {
			groups: function() {
		  		return $scope.groups; 
			} 
		  } 
		}); 		
	}; 

	var editGroupsCtrl = function($scope, $modalInstance, groups) {
		$scope.groups = groups; 
		$scope.states = userList; 

	    $scope.selected = undefined;
	    $scope.alerts = [];


	 	$scope.init = function() {
	 		$scope.alerts.push(username);
	 	}; 

	 	$scope.init(); 

		$scope.deleteUser = function(id) {
		  $scope.alerts.splice(id, 1);
		};

		$scope.selectMatch = function(selection) {
		  $scope.alerts.push(selection);
		};

		$scope.save = function() {
			var groupName = $("#group-name").val(); 

			//TODO: not until oop
			window.freedom.emit('edit-groups', {
				name: groupName, 
				users: $scope.alerts
			});

			var msg = {
				action: 'invite-group',
				name: groupName,
				from: username
			};

			for(var i = 0; i < $scope.alerts.length; i++) 
				if($scope.alerts[i] !== username)
					freedom.emit('send-message', {
					  to: $scope.alerts[i],
					  msg: JSON.stringify(msg)
					});
			
			$modalInstance.dismiss('cancel');
		};

		$scope.cancel = function() {
			$modalInstance.dismiss('cancel');
		};
	}

	$scope.editProfile = function() {
		if($scope.ownProfile != true) {
			alert("You don't have permission to edit this profile.");
			return; 
		}

		var modalInstance = $modal.open({
		  templateUrl: '/modals/editProfileTemplate.html',
		  windowClass:'normal',
		  controller: editProfileCtrl,
		  backdrop: 'static', 
		  resolve: {
				 description: function() {
		  		return $scope.description; 
			} 
		  } 
		}); 
	};

	 var editProfileCtrl = function ($scope, $modalInstance, description) {
	  //TODO: get email 
	  $scope.description = description; 

	  $scope.upload = function () {
	    var files = document.getElementById("addFile").files;

	    changeProfile(files, $("#profile_description_modal").val());
	    $modalInstance.dismiss('cancel');
	  };

	  $scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };
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

	function changeProfile(files, profile_description) {
	  $scope.description = profile_description; 

	  if(files[0]) {
	    var url = window.URL.createObjectURL(files[0]);
	    $("#profile_pic").attr('src', url); 
	    var reader = new FileReader(); 

	    reader.onload = function() {
	    var arrayBuffer = reader.result;

	    window.freedom.emit('edit-profile', {
	      description: profile_description, 
	      string: ab2str(arrayBuffer)
	    }); 
	   }

	   reader.readAsArrayBuffer(files[0]);
	 }
	 else if(profile_description !== "") {
	  window.freedom.emit('edit-profile', {
	    description: profile_description
	  });
	 } 
	}; 
});
