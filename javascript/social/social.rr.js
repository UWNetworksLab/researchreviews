function RRSocialProvider(dispatchEvent, webSocket) {
	this.dispatchEvent = dispatchEvent; 
	this.social = freedom.social(); 
  this.view = freedom['core.view']();
  this.storage = freedom.storageprovider();
	this.id = null;

  this.user = null;

  //this.storage.clear(); 
	this.users = {};
	this.clients = {}; 
}

RRSocialProvider.prototype.login = function(loginOpts, continuation) {
  // Wrap the continuation so that it will only be called once by
  // onmessage in the case of success.
  var finishLogin = {
    continuation: continuation,
    finish: function(msg, err) {
      if (this.continuation) {
        this.continuation(msg, err);
        delete this.continuation;
      }
    }
  };

  if(this.user != null) {
    finishLogin.finish(undefined, this.err("LOGIN_ALREADYONLINE"));
    return;
  }

  this.view.on('message', this.onmessage.bind(this, finishLogin));
  this.view.open('login', {file: 'login.html'}).then(this.view.show.bind(this.view));
};

RRSocialProvider.prototype.onmessage = function(finish, msg) {
  if (msg.action === "login"){
    this.storage.get(msg.user).then(function(state) {
      var got = JSON.parse(state);

      if (state && got.password === msg.password) {
        this.user = got;
        this.view.close();

       var ret = {
          'userId' : got.user,
          'clientId' : got.user,
          'status': 'ONLINE',
          'timestamp': '2'
        };

        this.storage.get('users').then(function(val) {
          var buddies; 
          try {
            buddies = JSON.parse(val);
          } catch(e) {}

          if(!buddies || typeof buddies !== "object") {
            buddies = []; 
          }

          this.users = buddies; 

          for(var i = 0; i < this.users.length; i++) {
            this.dispatchEvent('onUserProfile', {
              'userId': this.users[i]
            }); 
          }
        }.bind(this));

        finish.finish(ret);
      } else {
        this.view.postMessage('Invalid Credentials!');
      }
    }.bind(this));
  }
  else if (msg.action === "signup"){
    var newUser = {
      user: msg.user,
      password: msg.password
    };

    this.storage.set(msg.user, JSON.stringify(newUser));
    this.changeRoster(msg.user, true);
  } 
};

RRSocialProvider.prototype.changeRoster = function(id, stat) {
  var newStatus, result = {
    userId: id,
    clientId: id,
    timestamp: (new Date()).getTime()
  };
  if (stat) {
    newStatus = "ONLINE";
  } else {
    newStatus = "OFFLINE";
  }
  result.status = newStatus;

  if (stat) {
    this.storage.get('users').then(function(val) {
      var buddies; 
      try {
        buddies = JSON.parse(val);
      } catch(e) {}

      if(!buddies || typeof buddies !== "object") {
        buddies = []; 
      }

      buddies.push(id); 
      this.users = buddies; 
      this.storage.set('users', JSON.stringify(buddies)); 
    }.bind(this));
  } else {
    delete this.users[id];
    delete this.clients[id];
  }
  return result;
};

RRSocialProvider.prototype.getUsers = function(continuation) {
  if (this.user === null) {
    continuation(undefined, this.err("OFFLINE"));
    return;
  }
  continuation(this.friends);
};

RRSocialProvider.prototype.getClients = function(continuation) {
  if (this.user === null) {
    continuation(undefined, this.err("OFFLINE"));
    return;
  }
  continuation(this.clients);
};

RRSocialProvider.prototype.sendMessage = function(to, msg, continuation) {
  if (this.user === null) {
    continuation(undefined, this.err("OFFLINE"));
    return;
  }/* else if (!this.clients.hasOwnProperty(to) && !this.users.hasOwnProperty(to)) {
  console.log("got here");
    continuation(undefined, this.err("SEND_INVALIDDESTINATION"));
    return;
  }*/

  this.user.send({text: JSON.stringify({to: to, msg: msg})});//what does this do?
  //TODO: send message
  continuation();
};

RRSocialProvider.prototype.logout = function(continuation) {
  if (this.user === null) { // We may not have been logged in
    this.changeRoster(this.id, false);
    continuation(undefined, this.err("OFFLINE"));
    return;
  }
  this.user = null;
  this.changeRoster(this.id, false);
  continuation();
};

RRSocialProvider.prototype.err = function(code) {
  var err = {
    errcode: code,
    message: this.social.ERRCODE[code]
  };
  return err;
};

if (typeof freedom !== 'undefined') {
	freedom.social().provideAsynchronous(RRSocialProvider); 
}
