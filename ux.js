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
      backdrop: 'static',
      resolve: {
        myPapers: function() {
          return $scope.myPapers; 
        }
      }
    });
  };

  $window.freedom.on('added_paper', function(paperArray) {
    $scope.myPapers.push({
        date: paperArray[paperArray.length-1].date,
        title: paperArray[paperArray.length-1].title
    });
  });
});

var ModalInstanceCtrl = function ($scope, $modalInstance, myPapers) {
  $scope.myPapers = myPapers; 

  $scope.upload = function () {
    $scope.paperTitle = document.getElementById('title').value;
    $modalInstance.close($scope.paperTitle);

    window.freedom.emit('add_paper', $scope.paperTitle);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}; 

window.onload = function() {

}; 



  