//interactions
var app = angular.module('researcher_app', ['ui.bootstrap']);

app.controller('main_controller', function($scope, $http, $modal, $window) {
  /*$scope.deletePaper = function(paper, index) {
    window.freedom.emit('delete_paper', {
      title : paper.title
    });
    var index = this.row.rowIndex;
    $scope.myPapers.splice(index, 1);
  }*/ 

  $scope.addPaper = function() {
    console.log("add Paper button");
    var modalInstance = $modal.open({
      templateUrl: 'addPaperTemplate.html',
      windowClass:'normal',
      controller: addPaperCtrl,
      backdrop: 'static'
    });
  };
}); 

var addPaperCtrl = function ($scope, $modalInstance) {
  $scope.upload = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};  

window.onload = function() {
}; 