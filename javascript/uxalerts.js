app.controller('alertsController', function($scope, $controller) {
  $scope.showNav = true; 
	$scope.alerts;
  $scope.alertNum = alertNum; 

	$scope.init = function(){
		messageList.forEach(function(msg){
      if (msg.action === 'invite-reviewer') {
        if (!$scope.alerts) $scope.alerts = [];
        var alertMsg = 'You have been invited to review the paper ' + msg.title + ' v.' + msg.vnum + ' by ' + msg.author;
        if(oldMessageList.indexOf(alertMsg) == -1)
          oldMessageList.unshift(alertMsg);
      }
      else if (msg.action === 'add-review-on-author') {
        if (!$scope.alerts) $scope.alerts = [];
        msg.date = new Date(msg.date); 
        var alertMsg = msg.reviewer + ' reviewed your paper ' + msg.title + ' v.' + msg.vnum + ' on ' + msg.date.getFullYear() + "-" + (msg.date.getMonth()+1) + "-" + msg.date.getDate();
        if(oldMessageList.indexOf(alertMsg) == -1)
          oldMessageList.unshift(alertMsg);
      }
      else if(msg.action === 'invite-group') {
        if($scope.alerts) $scope.alerts = []; 
        var alertMsg = "You have been invited by " + msg.from + " to join the group " + msg.groupName; 
        if(oldMessageList.indexOf(alertMsg) == -1)
          oldMessageList.unshift(alertMsg); 
      }
		});
    $scope.alerts = oldMessageList;
		messageList = [];
	};
	$scope.init(); 
});