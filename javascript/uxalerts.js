app.controller('alertsController', function($scope, $controller, $location) {
  $scope.showNav = true; 
	$scope.alerts;
  $scope.alertNum = alertNum; 

	$scope.init = function(){
		messageList.forEach(function(msg){
      var alert = {}; 
      if (msg.action === 'invite-reviewer') {
        if (!$scope.alerts) $scope.alerts = [];
        alert.msg = 'You have been invited to review the paper ' + msg.title + ' v.' + msg.vnum + ' by ' + msg.author;
        alert.action = "reviewspage"; 
        if(oldMessageList.indexOf(alert) == -1)
          oldMessageList.unshift(alert);
      }
      else if (msg.action === 'add-review-on-author') {
        if (!$scope.alerts) $scope.alerts = [];
        msg.date = new Date(msg.date); 
        alert.msg = msg.reviewer + ' reviewed your paper ' + msg.title + ' v.' + msg.vnum + ' on ' + msg.date.getFullYear() + "-" + (msg.date.getMonth()+1) + "-" + msg.date.getDate();
        alert.action = "paperspage"; 
        if(oldMessageList.indexOf(alert) == -1)
          oldMessageList.unshift(alert);
      }
      else if(msg.action === 'invite-group') {
        if($scope.alerts) $scope.alerts = []; 
        alert.msg = msg.owner + " has added you to the group " + msg.name; 
        alert.action = "profilepage"; 
        if(oldMessageList.indexOf(alert) == -1)
          oldMessageList.unshift(alert); 
      }
		});
    $scope.alerts = oldMessageList;
		messageList = [];
	};
	$scope.init(); 

  $scope.changeView = function(view) {
    $location.path(view); 
  };
});
