//basically, ws right now. 

function RRSocialProvider(dispatchEvent, webSocket) {
	this.dispatchEvent = dispatchEvent; //??

	this.social = freedom.social(); 
	this.conn = null;
	this.id = null;

	this.users = {}; 
	this.clients{}; 
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

  if(this.conn != null) {
    finishLogin.finish(undefined, this.err("LOGIN_ALREADYONLINE"));
    return;
  }

  this.conn = this.websocket(this.WS_URL + loginOpts.agent);
  // Save the continuation until we get a status message for
  // successful login.
  this.conn.on("onMessage", this.onMessage.bind(this, finishLogin));
  this.conn.on("onError", function (cont, error) {
    this.conn = null;
    cont.finish(undefined, this.err('ERR_CONNECTION'));
  }.bind(this, finishLogin));
  this.conn.on("onClose", function (cont, msg) {
    this.conn = null;
    this.changeRoster(this.id, false);
  }.bind(this, finishLogin));
}; 

RRSocialProvider.prototype.getUsers = function(continuation) {
  if (this.conn === null) {
    continuation(undefined, this.err("OFFLINE"));
    return;
  }
  continuation(this.users);
};

RRSocialProvider.prototype.getClients = function(continuation) {
  if (this.conn === null) {
    continuation(undefined, this.err("OFFLINE"));
    return;
  }
  continuation(this.clients);
};

RRSocialProvider.prototype.sendMessage = function(to, msg, continuation) {
  if (this.conn === null) {
    continuation(undefined, this.err("OFFLINE"));
    return;
  } else if (!this.clients.hasOwnProperty(to) && !this.users.hasOwnProperty(to)) {
    continuation(undefined, this.err("SEND_INVALIDDESTINATION"));
    return;
  }

  this.conn.send({text: JSON.stringify({to: to, msg: msg})});
  continuation();
};

RRSocialProvider.prototype.logout = function(continuation) {
  if (this.conn === null) { // We may not have been logged in
    this.changeRoster(this.id, false);
    continuation(undefined, this.err("OFFLINE"));
    return;
  }
  this.conn.on("onClose", function(continuation) {
    this.conn = null;
    this.changeRoster(this.id, false);
    continuation();
  }.bind(this, continuation));
  this.conn.close();
};

RRSocialProvider.prototype.onMessage = function(finishLogin, msg) {
  var i;
  msg = JSON.parse(msg.text);

  // If state information from the server
  // Store my own ID and all known users at the time
  if (msg.cmd === 'state') {
    this.id = msg.id;
    for (i = 0; i < msg.msg.length; i += 1) {
      this.changeRoster(msg.msg[i], true);
    }
    finishLogin.finish(this.changeRoster(this.id, true));
  // If directed message, emit event
  } else if (msg.cmd === 'message') {
    this.dispatchEvent('onMessage', {
      from: this.changeRoster(msg.from, true),
      message: msg.msg
    });
  // Roster change event
  } else if (msg.cmd === 'roster') {
    this.changeRoster(msg.id, msg.online);
  // No idea what this message is, but let's keep track of who it's from
  } else if (msg.from) {
    this.changeRoster(msg.from, true);
  }
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