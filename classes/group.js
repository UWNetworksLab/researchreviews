function Group(gdata) {
  this.name = gdata.name;
  this.description = gdata.description;
  this.users = gdata.users;
  this.founder = gdata.founder;
}

Group.prototype.inviteUsers = function(){
      var msg = {
        action: 'invite-group',
        name: groupName,
        from: username
      };

      for(var i = 0; i < $scope.alerts.length; i++) 
        if($scope.alerts[i] !== username)
          window.freedom.emit('send-message', {
            to: $scope.alerts[i],
            msg: JSON.stringify(msg)
          });
};

Version.prototype.editComments = function(comments) {
  this.comments = comments; 
};

Version.prototype.editTitle = function(title) {
  this.title = title; 
};