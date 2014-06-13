//interactions
var app = angular.module('researcher_app', ['ngGrid', 'ui.bootstrap']);

app.controller('main_controller', function($scope, $http, $modal, $window) {
  $scope.submitter_dashboard = true; 
  $scope.myPapers = [];
  $scope.myReviews = []; 

  $scope.paperOptions = { data: 'myPapers' };

  $scope.reviewOptions = { data: 'myReviews' };

  $scope.toReviewer = function() {
    $scope.submitter_dashboard = false; 
  }

  $scope.toSubmitter = function() {
    $scope.submitter_dashboard = true; 
  }

  $scope.addPaper = function() {
    var modalInstance = $modal.open({
      templateUrl: 'paperModalTemplate.html',
      controller: ModalInstanceCtrl,
      size: 'lg',
      backdrop: 'static'
    });
  };

  $window.freedom.on('added_paper', function(data) {
    var dd = data.date.getDate();
    var mm = data.date.getMonth()+1; 
    var yyyy = data.date.getFullYear();
    $scope.myPapers.push({
        date: yyyy+'-'+mm+'-'+dd,
        title: data.title
    });
  }); 
});

var ModalInstanceCtrl = function ($scope, $modalInstance) {
  $scope.upload = function () {
    var fileArray = document.getElementById('addFile').files; 
    uploadFile(fileArray);  
    $modalInstance.close(fileArray);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}; 

function uploadFile(fileArray) { 
  if(fileArray.length < 1) {
    console.error("no file found");
    document.getElementById("fileError").textContent = "no paper uploaded..."; 
    return; 
  }
  document.getElementById('fileError').textContent = "";

  var newPaper = fileArray[0]; 
  var fileReader = new FileReader(); 

  console.log("a file found: " + newPaper.name);

  var today = new Date();  
  var key = Math.random() + "";

  window.freedom.emit('add_paper', {
    title: newPaper.name,
    value: newPaper, 
    date: today,
    key: key 
  });
} 

window.onload = function() {

}; 



  