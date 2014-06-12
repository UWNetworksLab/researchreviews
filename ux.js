//interactions
var app = angular.module('researcher_app', ['ngGrid', 'ui.bootstrap']);

app.controller('main_controller', function($scope, $http, $modal) {
  $scope.submitter_dashboard = true; 

  $http.get('./papers.json').success(function (data) {
    $scope.myPapers = data; 
  });

  $http.get('./reviews.json').success(function (data) {
    $scope.myReviews = data; 
  });

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
});

var ModalInstanceCtrl = function ($scope, $modalInstance, myPapers) {
  $scope.myPapers = myPapers; 

  $scope.upload = function () {
    $scope.paperTitle = document.getElementById('title').value;
    $modalInstance.close($scope.paperTitle);
    console.log("title: " + $scope.paperTitle);

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();

    $scope.myPapers.push({
      date: yyyy+'-'+mm+'-'+dd,
      title: $scope.paperTitle 
    });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}; 

window.onload = function() {

  window.freedom.emit('switch-dashboard', 'submitter');



}; 



  