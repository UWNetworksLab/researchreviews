app.controller('profileController', function($scope, $modal, $location) {
  	$scope.description = "No description added yet."; 
  	$scope.papers; 
  	$scope.reviews; 
  	$scope.showNav = true; 

  	window.freedom.emit('load-profile', $location.search().username);
  	window.freedom.emit('get-papers', 0);
  	window.freedom.emit('get-reviews', 1);

	window.freedom.on('display-profile', function(data) {
	  if(data.string === "" && data.description === "") {
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

	window.freedom.on('display-papers', function(data) {
		$scope.papers = data.papers; 
		$scope.$apply(); 
	}); 

	window.freedom.on('display-reviews', function(data) {
		for(var key in data.reviews) 
			data.reviews[key].date = new Date(data.reviews[key].date); 		
		$scope.reviews = data.reviews;
		$scope.$apply(); 
	});

	 $scope.changeView = function(view){
	    $location.path(view);  
	 };

	  $scope.editProfile = function() {
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