function Group(gdata) {
  this.name = gdata.name;
  this.description = gdata.description;
  this.users = gdata.users;
  this.owner = gdata.owner;
}

Group.prototype.inviteUsers = function(){
  var msg = {
    action: 'invite-group',
    group: this
  };

  for(var i = 0; i < this.users.length; i++) 
    if(this.users[i] !== username)
      window.freedom.emit('send-message', {
        to: this.users[i],
        msg: JSON.stringify(msg)
      });
};

Version.prototype.editComments = function(comments) {
  this.comments = comments; 
};

Version.prototype.editTitle = function(title) {
  this.title = title; 
};