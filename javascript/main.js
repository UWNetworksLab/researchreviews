//backend

var store = freedom.localstorage();
var social = freedom.socialprovider(); 
var myClientState = null;

var userList = []; 
var username; 

freedom.on('get-reviews', function(pending) {

  var promise = store.get(username + 'reviews');
  promise.then(function(val) {
    var reviews; 
    try {
      reviews = JSON.parse(val);
    } catch(e) {}
    if(!reviews || typeof reviews !== "object") reviews = {};     
    for (var key in reviews){
      var rpending = (reviews[key].rstring) ? 0 : 1;
      if (rpending !== pending){
        delete reviews[key];
      } 
    }
    freedom.emit('display-reviews', {
      reviews: reviews
    }); 
  }); 
}); 

freedom.on('get-r-paper', function(data){
  console.log("SENDING R PAPER");
  social.sendMessage(data.to, JSON.stringify(data)).then(function(ret) {
  }, function(err) {
    freedom.emit("recv-err", err);
  });
});

/*backend storing review
rkey,
rstring,

pkey,
ptitle,
author
vnum */ 

social.on('onMessage', function(data) { //from social.mb.js, onmessage
  var parse = JSON.parse(data.message);
  if (parse.action === "invite-reviewer"){

    var review = {
      ptitle: parse.title, 
      pkey: parse.key,
      author: parse.author,
      vnum: parse.vnum, 
      rkey: Math.random() + ""
    };

    //TODO: r_comments 
    var alertmsg = {
      action: 'invite-reviewer',
      title: parse.title,
      author: parse.author   
    };
    freedom.emit('alert', alertmsg);

    var promise = store.get(username + 'reviews');
    promise.then(function(val) {
      var reviews; 
      try {
        reviews = JSON.parse(val);
      } catch(e) {}

      if(!reviews || typeof reviews !== "object") reviews = {}; 

      reviews[review.rkey] = review; 
      console.log("RKEY OF INVITED REVIEWER " + review.rkey);
      store.set(username + 'reviews', JSON.stringify(reviews)); 
    });
  }
  else if(parse.action === 'allow-access') {
    var promise = store.get(username+'private-papers');
    promise.then(function(val) {
      var papers; 
      try {
        papers = JSON.parse(val);
      } catch(e) {}
     if(!papers || typeof papers !== "object") papers = {}; 
     console.log(parse);
      papers[parse.key] = parse; 
      store.set(username+'private-papers', JSON.stringify(papers)); 
    });
  }
  else if (parse.action === "get-profile"){
    var promise = store.get(username + 'profile');
    promise.then(function(val) {
      var profile; 
      try {
        profile = JSON.parse(val);
      } catch(e) {}
      if(!profile || typeof profile !== "object") {
        profile = {
          string: "",
          description: "", 
        };
      }
      profile.action = 'got-profile'; 
      profile.username = username; 
      social.sendMessage(parse.from, JSON.stringify(profile));
    });
  }
  else if (parse.action === "got-profile"){
    freedom.emit('display-profile', parse);
    var data = {
      id: parse.username, 
      onLogin: false 
    };
    freedom.emit('recv-uid', data); 
  }
//get our own papers to send back
  else if (parse.action === 'get-r-paper'){
    var promise = store.get(username + 'papers');
    promise.then(function(val) {
      var papers = JSON.parse(val);

      var msg = {
        action: 'send-r-paper'
      };
      if (papers[parse.key]) msg.version = papers[parse.key].versions[parse.vnum];
      social.sendMessage(parse.from, JSON.stringify(msg));
    });
  }

  else if (parse.action === 'add-review-on-author'){
    console.log("ADD REVIEW" + JSON.stringify(parse));
    //TODO: now sending over binary string, only need to send key etc
    var promise = store.get(username + 'papers');
    promise.then(function(val) {
      var papers = JSON.parse(val);

      if (!papers[parse.pkey].versions[parse.vnum].reviews)
        papers[parse.pkey].versions[parse.vnum].reviews = [];
      
      papers[parse.pkey].versions[parse.vnum].reviews.push(parse);
      store.set(username + 'papers', JSON.stringify(papers)); 

    //review alert
      var alertmsg = {
        action: 'add-review-on-author',
        title: papers[parse.pkey].versions[parse.vnum].title,
        date: parse.date,
        reviewer: parse.reviewer   
      };
      freedom.emit('alert', alertmsg);
    });
  }
  freedom.emit('recv-message', parse);    
});

freedom.on('upload-review', function(parse){
  console.log("UPLOADED REVIEW" + parse.pkey);
  var promise = store.get(username + 'reviews');
  promise.then(function(val) {
    var reviews; 
    try {
      reviews = JSON.parse(val);
    } catch(e) {}

    if(!reviews || typeof reviews !== "object") reviews = {}; 
    console.log("RKEY OF UPLOADED REVIEW " + parse.rkey);
    reviews[parse.rkey] = parse;
    store.set(username + 'reviews', JSON.stringify(reviews));
  }); 

//only info the author gets
  var reviewForAuth = {
    reviewer : parse.reviewer,
    rkey: parse.rkey,
    pkey: parse.pkey,
    vnum: parse.vnum,
    date: parse.date,
    action: 'add-review-on-author'
  };

  social.sendMessage(parse.author, JSON.stringify(reviewForAuth)).then(function(ret) {
  }, function(err) {
    freedom.emit("recv-err", err);
  });
});

freedom.on('send-message', function(val) {
  social.sendMessage(val.to, val.msg).then(function(ret) {
  }, function(err) {
    freedom.emit("recv-err", err);
  });
});

social.on('onUserProfile', function(data) {
  if(data.userId !== 'publicstorage' && data.userId !== username) 
    userList.push(data.userId); 
  freedom.emit('new-user', data.userId);
});
 
/*freedom.on('get-users', function(data) {
  var msg = {
    action: data, 
    userList: userList
  };
  freedom.emit('send-users', msg);
});*/

freedom.on('edit-privacy', function(msg) {
  data = JSON.parse(msg); 
 var promise = store.get(username + 'papers');
  promise.then(function(val) {
    var papers; 
    try {
      papers = JSON.parse(val);
    } catch(e) {}

    if(!papers || typeof papers !== "object") {
      papers = []; 
    } 

    papers.forEach(function(paper) {
      if(paper.key == data.key) {
        if(data.action === 'toPublic') { //change to public
          paper.versions[data.vnum].viewList = false; 
          paper.versions[data.vnum].privateSetting = false; 
        }
        else if(data.action === 'toPrivate'){ //change to private
          paper.versions[data.vnum].viewList = paper.versions[data.vnum].alertList; 
          paper.versions[data.vnum].privateSetting = true; 
        }
      }
    });

    store.set(username + 'papers', JSON.stringify(papers));  
  });  
});

freedom.on('edit-profile', function(data) {
  var promise = store.get(username + 'profile');
  promise.then(function(val) {
    var profile; 
    try {
      profile = JSON.parse(val);
    } catch(e) {}

    if(!profile || typeof profile !== "object") {
      profile = {
        url: "", 
        description: ""
      }; 
    }
  
    if(data.string)
      profile.string = data.string;
    profile.description = data.description; 

    store.set(username + 'profile', JSON.stringify(profile)); 
  }); 
});

freedom.on('load-profile', function(data) {
  if (data === 0){
    var promise = store.get(username + 'profile');
    promise.then(function(val) {
      var profile; 
      try {
        profile = JSON.parse(val);
      } catch(e) {}

      if(!profile || typeof profile !== "object") {
        profile = {
          string: "", 
          description: ""
        }; 
      }

      profile.username = username; 
      freedom.emit('display-profile', profile);
      var msg = {
        id: username,
        onLogin: false
      };
      freedom.emit('recv-uid', msg); 
    });
  }
  else {
    var message = {
      action: 'get-profile',
      from: username
    };
    social.sendMessage(data, JSON.stringify(message)).then(function(ret) {
    }, function(err) {
      freedom.emit("recv-err", err);
    });
  }
});

freedom.on('add-version', function(data) {
  var promise = store.get(username + 'papers');
  promise.then(function(val) {
    var papers; 
    try {
      papers = JSON.parse(val);
    } catch(e) {}

    if(!papers || typeof papers !== "object") {
      papers = {}; 
    }
    
    data.vnum = papers[data.key].versions.length;
    papers[data.key].versions.push(data);
    freedom.emit('display-new-version', papers[data.key]);

    //TODO: make sure sharing versions works
    //SHARE PAPER WITH USERS ALLOWED TO VIEW IT
    /*var paper = {
      title: newPaper.versions[0].title,
      author: username,
      key: data.key, 
      action: 'add-paper'
    };

    if(!data.viewList) //public (send paper to public storage)
      social.sendMessage("publicstorage", JSON.stringify(paper)).then(function(ret) {
      }, function(err) {
        freedom.emit("recv-err", err);
      });
    else { //private (send private paper to viewList) 
      paper.action = 'allow-access';
      for(var i = 0; i < data.viewList.length; i++) {
        social.sendMessage(data.viewList[i], JSON.stringify(paper)).then(function(ret) {
        }, function(err) {
          freedom.emit("recv-err", err);
        });
      }
    }

    //SHARE PAPER WITH REVIEWERS
    var msg = {
      title: newPaper.versions[0].title, 
      author: username, 
      vnum: 0, 
      key: data.key,
      action: 'invite-reviewer' 
    };

    for(var i = 0; i < data.alertList.length; i++) {
      social.sendMessage(data.alertList[i], JSON.stringify(msg)).then(function(ret) {
      }, function(err) {
        freedom.emit("recv-err", err);
      });
    }*/ 
    store.set(username + 'papers', JSON.stringify(papers)); 
  }); 
}); 

freedom.on('add-paper', function(data) {
  var promise = store.get(username + 'papers');
  promise.then(function(val) {
    var papers; 
    try {
      papers = JSON.parse(val);
    } catch(e) {}

    if(!papers || typeof papers !== "object") {
      papers = {}; 
    }
    
    data.vnum = 0;
    data.key = Math.random() + ""; 
    var newPaper = {
      key: data.key, 
      versions: [data] 
    };

    papers[data.key] = newPaper; 

    //SHARE PAPER WITH USERS ALLOWED TO VIEW IT
    var paper = {
      title: newPaper.versions[0].title,
      author: username,
      key: data.key, 
      action: 'add-paper'
    };

    if(!data.privateSetting) //public (send paper to public storage) 
      social.sendMessage("publicstorage", JSON.stringify(paper)).then(function(ret) {
      }, function(err) {
        freedom.emit("recv-err", err);
      });

    else { //private (send private paper to viewList) 
      paper.action = 'allow-access';
      for(var i = 0; i < data.viewList.length; i++) {
        social.sendMessage(data.viewList[i], JSON.stringify(paper)).then(function(ret) {
        }, function(err) {
          freedom.emit("recv-err", err);
        });
      }
    }

    //SHARE PAPER WITH REVIEWERS
    var msg = {
      title: newPaper.versions[0].title, 
      author: username, 
      vnum: 0, 
      key: data.key,
      action: 'invite-reviewer' 
    };

    for(var i = 0; i < data.alertList.length; i++) {
      social.sendMessage(data.alertList[i], JSON.stringify(msg)).then(function(ret) {
      }, function(err) {
        freedom.emit("recv-err", err);
      });
    }

    freedom.emit('display-new-paper', newPaper);
    store.set(username + 'papers', JSON.stringify(papers)); 
  }); 
});

freedom.on('get-papers', function(data) {
  var promise = store.get(username + 'papers');
  promise.then(function(val) {
    var papers; 
    try {
      papers = JSON.parse(val);
    } catch(e) {}

    if(!papers || typeof papers !== "object") {
      papers = {}; 
    }

    var msg = { 
      papers: papers 
    }; 

    freedom.emit('display-papers', msg);
  });  
});

freedom.on('load-private-papers', function(data) {
  var promise = store.get(username+'private-papers');
  promise.then(function(val) {
    var papers; 
    try {
      papers = JSON.parse(val);
    } catch(e) {}

    if(!papers || typeof papers !== "object") {
      papers = []; 
    }

    freedom.emit('send-private-papers', papers); 
  });  
});

freedom.on('load-public-storage', function(data){
  var message = {
    username: username,
    action: 'get-public-papers'
  };
  social.sendMessage("publicstorage", JSON.stringify(message)).then(function(ret) {
  }, function(err) {
    freedom.emit("recv-err", err);
  });
});

freedom.on('delete-paper', function(key){
  var promise = store.get(username + 'papers');
  promise.then(function(val) {
    var papers; 
    try {
      papers = JSON.parse(val);
    } catch(e) {}

    delete papers[key];

    //to send to publicstorage
    var paper ={
      key: key, 
      action: 'delete-paper'
    };

    social.sendMessage("publicstorage", JSON.stringify(paper)).then(function(ret) {
    }, function(err) {
      freedom.emit("recv-err", err);
    });

    store.set(username+'papers', JSON.stringify(papers)); 
    freedom.emit('display-delete-paper', key);
  }); 
});

social.login({
  agent: 'rr', 
  version: '0.1',
  url: '',
  interactive: true,
  rememberLogin: false
}).then(function(ret) {
  myClientState = ret;
  username = ret.userId;

  if (ret.status == social.STATUS["ONLINE"]) {
    var data = {
      id: ret.userId, 
      onLogin: true,
      userList: userList
    };
    freedom.emit('recv-uid', data);
    freedom.emit('recv-status', "online");
       
  } else {
    freedom.emit('recv-status', "offline");
  }
}, function(err) {
  freedom.emit("recv-err", err);
});