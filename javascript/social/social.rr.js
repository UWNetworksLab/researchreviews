//basically, ws right now. 

function RRSocialProvider(dispatchEvent, webSocket) {
	this.dispatchEvent = dispatchEvent; //??
	this.social = freedom.social(); 
  this.view = freedom['core.view']();
  this.storage = freedom.storageprovider();
	this.conn = null;
	this.id = null;
  
  //this.storage.clear(); 
	this.users = {};
	this.friends = {}; 
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
  console.log("here");
  if (msg.action === "login"){
    console.log("in login msg");
    this.storage.get(msg.user).then(function(state) {
      var got = JSON.parse(state);

      console.log("credentials: " + msg.user + msg.password);
      console.log("state: " +got.user + got.password);

      if (state && got.password === msg.password) {
        this.user = got;
        console.log("we did it");
        this.view.close();

       var ret = {
          'userId' : got.user,
          'clientId' : got.user,
          'status': 'ONLINE',
          'timestamp': '1'
        };

        finish.finish(ret);
      } else {
        console.log("wrong credentials");
        this.view.postMessage('Invalid Credentials!');
      }
    }.bind(this));
  }
  else if (msg.action === "signup"){
    console.log("in signup msg " + msg.user + " " + msg.password);
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
    console.log("change roster: " + result.userId + " " + result.timestamp);
    this.users[id] = result;
    this.dispatchEvent('onUserProfile', this.users[id]);
  } else {
    delete this.users[id];
    delete this.clients[id];
  }
  return result;
};

RRSocialProvider.prototype.getUsers = function(continuation) {
  console.log("GET USERS");
  if (this.user === null) {
    continuation(undefined, this.err("OFFLINE"));
    return;
  }
  console.log(this.friends);
  continuation(this.friends);
};

RRSocialProvider.prototype.getClients = function(continuation) {
  console.log("here");
  if (this.user === null) {
    continuation(undefined, this.err("OFFLINE"));
    return;
  }
  continuation(this.clients);
};

RRSocialProvider.prototype.sendMessage = function(to, msg, continuation) {
  console.log("here");
  if (this.user === null) {
    continuation(undefined, this.err("OFFLINE"));
    return;
  } else if (!this.clients.hasOwnProperty(to) && !this.users.hasOwnProperty(to)) {
    continuation(undefined, this.err("SEND_INVALIDDESTINATION"));
    return;
  }

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
