//basically, ws right now. 

function RRSocialProvider(dispatchEvent, webSocket) {
	this.dispatchEvent = dispatchEvent; //??

	this.social = freedom.social(); 
  this.view = freedom['core.view']();
  this.storage = freedom.storageprovider();
	this.conn = null;
	this.id = null;

	this.user = null;
	this.friends = {}; 
	this.clients = {}; 

  var me = {
    user: 'bonnie',
    password: 'pan'
  };
  this.storage.set('bonnie', JSON.stringify(me));

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

  this.view.once('message', this.onCredentials.bind(this, finishLogin));
  this.view.open('login', {file: 'login.html'}).then(this.view.show.bind(this.view));
};

RRSocialProvider.prototype.onCredentials = function(finish, credentials) {
  console.log("here");
  this.storage.get(credentials.user).then(function(state) {
    var got = JSON.parse(state);

    console.log("credentials: " + credentials.user + credentials.password);
    console.log("state: " +got.user + got.password);

    if (state && got.password === credentials.password) {
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
      this.view.postMessage('Invalid Credentials!');
    }
  }.bind(this));
};

RRSocialProvider.prototype.getUsers = function(continuation) {
  console.log("here");
  if (this.user === null) {
    continuation(undefined, this.err("OFFLINE"));
    return;
  }
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
