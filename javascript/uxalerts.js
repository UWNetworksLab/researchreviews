app.controller('alertsController', function($scope, $controller) {
  $scope.showNav = true; 
	console.log("NUM ALERTS " + $scope.numAlerts);
	
	$scope.alerts;
	$scope.init = function(){
		$scope.alerts = oldMessageList;

		messageList.forEach(function(msg){
      if (msg.action === 'invite-reviewer') {
        if (!$scope.alerts) $scope.alerts = [];
        var alertMsg = 'You have been invited to review the paper ' + msg.title + ' by ' + msg.author;
        oldMessageList.push(alertMsg);
      }
      else if (msg.action === 'add-review-on-author') {
        if (!$scope.alerts) $scope.alerts = [];
        var alertMsg = msg.reviewer + ' reviewed your paper, ' + msg.title + ' on ' + msg.date;
        oldMessageList.push(alertMsg);
      }
		});
		messageList = [];
	};
	$scope.init(); 

/*  window.freedom.on('got-alerts', function(alerts){
  var badges = document.getElementsByClassName("badge"); 
  for(var i = 0; i < badges.length; i++) {
    badges[i].innerHTML = "";  
  }

  var parse = JSON.parse(alerts);
  var alerts_table = document.getElementById('alerts-table');
  var newBody = document.createElement('tbody');

  for (var i = 0; i < parse.length; i++){
    var p = document.createElement('tr');
    if (parse[i].action === "invite-reviewer"){
      p.innerHTML =  "<th>You were invited to review the paper " + parse[i].title + " by " + parse[i].author + (parse[i].comments? ": " + parse[i].comments : "") + "</th>"; 
    }
    else if(parse[i].action === 'add-review') {
      //TODO: have key, vnum, but need title?! 
      p.innerHTML = "<th>" + parse[i].reviewer + " reviewed your paper</th>";
    }
    else if(parse[i].action === 'add-coauthor') {
      p.innerHTML = "<th> You were added as a coauthor of the paper " + parse[i].title + " by " + parse[i].author + " </th>";  
    }

    if (i >= parse.length - alertNum) { 
      p.style.color = "#3CB371";    
    }

    newBody.insertBefore(p, newBody.childNodes[0]);
  }
  alerts_table.replaceChild(newBody, alerts_table.childNodes[0]);
  alertNum = 0;

  if (parse.length === 0) alerts_table.innerHTML = "You have no new alerts.";
});
*/


});