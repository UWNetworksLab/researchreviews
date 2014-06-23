//interactions
var app = angular.module('researcher_app', ['ngGrid', 'ui.bootstrap']);

app.controller('main_controller', function($scope, $http, $modal, $window) {
  $scope.submitter_dashboard = true; 
  $scope.myPapers = [];
  $scope.myReviews = []; 

  $scope.paperOptions = { 
    data: 'myPapers',
    multiSelect: false,
    columnDefs: [
    { field: 'title', displayName: 'title' },
    { field: 'date', displayName: 'date' }, 
    { displayName: '', cellTemplate: '<button id="viewPaperBtn" type="button" ng-click="viewPaper(row.entity)">view paper</button>'},
    { displayName: '', cellTemplate: '<button id="deletePaperBtn" type="button" ng-click="deletePaper(row.entity, $index)">delete paper</button>'}]
  };

  $scope.reviewOptions = { data: 'myReviews' };

  $scope.deletePaper = function(paper, index) {
    window.freedom.emit('delete_paper', {
      title : paper.title
    });
    var index = this.row.rowIndex;
    $scope.myPapers.splice(index, 1);
  }

  $scope.viewPaper = function(paper) {
    var modalInstance = $modal.open({
      templateUrl: 'viewPaperTemplate.html',
      controller: viewPaperCtrl,
      size: 'lg',
      backdrop: 'static', 
      resolve: {
        title: function() {
          return paper.title; 
        }
      }
    });
  }

  $scope.toReviewer = function() {
    $scope.submitter_dashboard = false; 
  }

  $scope.toSubmitter = function() {
    $scope.submitter_dashboard = true; 
  }

  $scope.addPaper = function() {
    var modalInstance = $modal.open({
      templateUrl: 'addPaperTemplate.html',
      windowClass:'normal',
      controller: addPaperCtrl,
      size: 'lg',
      backdrop: 'static'
    });
  };

  $window.freedom.on('added_paper', function(data) {//necessary?
    var dd = data.date.getDate();
    var mm = data.date.getMonth()+1; 
    var yyyy = data.date.getFullYear();
    $scope.myPapers.push({
        date: yyyy+'-'+mm+'-'+dd,
        title: data.title
    });

    var file = data.value;

  }); 
});

var viewPaperCtrl = function($scope, $modalInstance, title) {
  $scope.viewPaperTitle = title; 

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel'); 
  };
}; 

var addPaperCtrl = function ($scope, $modalInstance) {
  $scope.upload = function () {
    var fileArray = document.getElementById('addFile').files; 
    if (!fileArray.length) {
      alert('Must select a file.');
      return;
    }

    var today = new Date();  
    var key = Math.random() + "";
    var newPaper = fileArray[0]; 
    var fileReader = new FileReader(); 

    console.log("a file found: " + newPaper.name);

//    var fileBlob = newPaper.slice(0, newPaper.size);
//    fileReader.readAsBinaryString(fileBlob);

//    fileReader.onloadend = function(evt) {
//      if (evt.target.readyState == FileReader.DONE) { // DONE == 2

        window.freedom.emit('add_paper', {
          title: newPaper.name,
          value: newPaper, 
          date: today,
//          content: evt.target.result,
          key: key
        });
//      }
//    };
  $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

window.onload = function() {
}; 