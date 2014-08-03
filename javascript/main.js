//backend

var store = freedom.localstorage();
var social = freedom.socialprovider(); 
var myClientState = null;

var userList = []; 
var messageList = []; 

//store.set('papers', []);

freedom.on('get-r-papers', function(pending) {
  var promise = store.get(username + 'r_papers');
  promise.then(function(val) {
    var papers; 
    try {
      papers = JSON.parse(val);
    } catch(e) {}

    if(!papers || typeof papers !== "object") papers = []; 
    var i = papers.length;
    while (i--){
      if (papers[i].pending !== pending){
        console.log("PENDING NOT MATCH " + i);
        papers.splice(i, 1);
      }
    }
    freedom.emit('display-reviews', {
      papers: papers
    }); 
  }); 
}); 

freedom.on('get-pending-r-view', function(data){
  var msg = {
    action: 'get-r-paper',
    key: data.key,
    vnum: data.vnum,
    from: username
  };

  social.sendMessage(data.username, JSON.stringify(msg)).then(function(ret) {
  }, function(err) {
    freedom.emit("recv-err", err);
  });
});

freedom.on('load-alerts', function(data){
  freedom.emit('got-alerts', JSON.stringify(messageList));
});

social.on('onMessage', function(data) { //from social.mb.js, onmessage
  var parse = JSON.parse(data.message);
  if (parse.action === "invite-reviewer"){
    messageList.push(parse); 
    var promise = store.get(username + 'r_papers');
    promise.then(function(val) {
      var papers; 
      try {
        papers = JSON.parse(val);
      } catch(e) {}

      if(!papers || typeof papers !== "object") papers = []; 
      parse.pending = 1;
      papers.push(parse); 
      store.set(username + 'r_papers', JSON.stringify(papers)); 
    });
  }
  else if(parse.action === 'allow-access') {
    var promise = store.get(username+'private-papers');
    promise.then(function(val) {
      var papers; 
      try {
        papers = JSON.parse(val);
      } catch(e) {}

     if(!papers || typeof papers !== "object") {
        console.log("nothing in papers");
        papers = []; 
      }
      papers.push(parse); 
      store.set(username+'private-papers', JSON.stringify(papers)); 
    });
  }
  else if(parse.action === 'add-coauthor') {
    messageList.push(parse); 
    //make sure coauthor is added to author[] in new paper 
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
      for(var i = 0; i < papers.length; i++){
        if (papers[i].key.toString() === parse.key.toString()){
          for (var j = 0; j < papers[i].versions.length; j++){
            var msg = {
              version: papers[i].versions[j],
              action: 'send-r-paper'
            };
            social.sendMessage(parse.from, JSON.stringify(msg));
            return;
          }
        }
      }
      var noPaper = {
        version: [],
        action: 'send-r-paper'
      };
      social.sendMessage(parse.from, JSON.stringify(noPaper));
    });
  }

  else if (parse.action === 'send-r-paper'){
  }

  else if (parse.action === 'add-review'){
    messageList.push(parse); 
    //TODO: now sending over binary string, only need to send key etc
    var promise = store.get(username + 'papers');
    promise.then(function(val) {
      var papers = JSON.parse(val);
      for(var i = 0; i < papers.length; i++){
        if (papers[i].key.toString() === parse.key.toString()){
          if(!papers[i].versions[parse.vnum].reviews)
            papers[i].versions[parse.vnum].reviews = []; 
          
          papers[i].versions[parse.vnum].reviews.push(parse);
          break;
        }
      }
      store.set(username + 'papers', JSON.stringify(papers)); 
    });
  }
  freedom.emit('recv-message', JSON.stringify(parse));    
});

freedom.on('upload-review', function(data){
  var parse = JSON.parse(data);

//get papers and update them with pending = 0
  var promise = store.get(username + 'r_papers');
  promise.then(function(val) {
    var papers; 
    try {
      papers = JSON.parse(val);
    } catch(e) {}

if(!papers || typeof papers !== "object") papers = []; 
    for (var i = 0; i < papers.length; i++){
      if (parse.key === papers[i].key){
        papers[i].pending = 0;
        break;
      }
    }
    store.set(username + 'r_papers', JSON.stringify(papers));
  }); 

  social.sendMessage(parse.author, data).then(function(ret) {
    //console.log
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
});
 
freedom.on('get-users', function(data) {
  var msg = {
    action: data, 
    userList: userList
  };
  freedom.emit('send-users', msg);
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

freedom.on('edit-privacy', function(data) {
  var parse = JSON.parse(data); 

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
      if(paper.key == parse.key) {
        if(parse.publicSetting) { //change to public
          paper.versions[parse.vnum].viewList = false; 
          console.log("change private to public.... viewList: " + paper.versions[parse.vnum].viewList + " alertList " + paper.versions[parse.vnum].alertList);
        }
        else { //change to private
          console.log("got here: " + paper.versions[0].title + data.vnum);
          console.log("change public to private.... viewList: " + JSON.stringify(paper.versions[parse.vnum].viewList) + " alertList " + JSON.stringify(paper.versions[parse.vnum].alertList));
          paper.versions[parse.vnum].viewList = paper.versions[parse.vnum].alertList; 
        }
      }
    });

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
      papers = []; 
    }

    if(data.key) { //add new version //TODO: make sure version works for sharing papers
      for(var i = 0; i < papers.length; i++)
        if(papers[i].key == data.key) {
          data.vnum = papers[i].versions.length; 
          papers[i].versions.push(data); 
          break;
        }
      freedom.emit("display-new-version", papers[i]);
    }
    else { //add new paper
      data.vnum = 0;
      data.key = Math.random() + ""; 
      var newPaper = {
        key: data.key, 
        versions: [data] 
      };

      papers.push(newPaper); 

      //to send to publicstorage
      var paper = {
        title: newPaper.versions[0].title,
        author: username,
        key: data.key, 
        action: 'add-paper'
      };

      if(!data.viewList) //publicly shared
        social.sendMessage("publicstorage", JSON.stringify(paper)).then(function(ret) {
        }, function(err) {
          freedom.emit("recv-err", err);
        });
      else { //send private paper to viewList
        paper.action = 'allow-access';
        for(var i = 0; i < data.viewList.length; i++) {
          social.sendMessage(data.viewList[i], JSON.stringify(paper)).then(function(ret) {
          }, function(err) {
            freedom.emit("recv-err", err);
          });
        }
      }

      var msg = {
        title: newPaper.versions[0].title, 
        author: username, 
        vnum: 0, 
        key: data.key,
        action: 'invite-reviewer' 
      };

      console.log(JSON.stringify(data.alertList));

      for(var i = 0; i < data.alertList.length; i++) {
        console.log("trying to send to " + data.alertList[i]);
        social.sendMessage(data.alertList[i], JSON.stringify(msg)).then(function(ret) {
        }, function(err) {
          freedom.emit("recv-err", err);
        });
      }

      freedom.emit('display-new-paper', newPaper);
    }
    store.set(username + 'papers', JSON.stringify(papers)); 
  }); 
});

freedom.on('get-paper-view', function(data) {
  var promise = store.get(username + 'papers');
  promise.then(function(val) {
    var papers; 
    try {
      papers = JSON.parse(val);
    } catch(e) {}

    if(!papers || typeof papers !== "object") {
      console.log("nothing in papers");
      papers = []; 
    }
   for(var i = 0; i < papers.length; i++){
      if(papers[i].key == data.key) {
        if(data.vnum == -1) { //from clicking paper table
          var action = 1;
          if (papers[i].versions.length == 1) action = 0;
          freedom.emit("got-paper-view", {version: papers[i].versions[papers[i].versions.length-1], action: action});
        }

        //all from clicking prev and next? action is disabling prev and next buttons
        //TODO: make this cleaner?
        else if(data.vnum > 0 && data.vnum < papers[i].versions.length-1) { //clicking prev and next, version exists
          freedom.emit("got-paper-view", {version: papers[i].versions[data.vnum]});
        }
        else if(data.vnum == 0) { //if number disable
          freedom.emit("got-paper-view", {version: papers[i].versions[0], action: -1});
        }
        else if(data.vnum >= papers[i].versions.length-1){
          freedom.emit("got-paper-view", {version: papers[i].versions[papers[i].versions.length-1], action: 1});          
        }
        break;
      }
    }
  });  
});

freedom.on('load-private-papers', function(data) {
  console.log("got here");
  var promise = store.get(username+'private-papers');
  promise.then(function(val) {
    var papers; 
    try {
      papers = JSON.parse(val);
    } catch(e) {}

    if(!papers || typeof papers !== "object") {
      console.log("nothing in papers");
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

freedom.on('load-papers', function(data) {
  console.log('loading papers for ' + username);

  var promise = store.get(username + 'papers');
  promise.then(function(val) {
    var papers; 
    try {
      papers = JSON.parse(val);
    } catch(e) {}

  if(!papers || typeof papers !== "object") papers = []; 
      freedom.emit('display-table-and-view', papers); 
    }); 
});

freedom.on('delete-paper', function(key){
  var promise = store.get(username + 'papers');
  promise.then(function(val) {
    var papers; 
    try {
      papers = JSON.parse(val);
    } catch(e) {}

    for(var i = 0; i < papers.length; i++){
      if(papers[i].key == key) {
        papers.splice(i, 1);
        break;
      }
    }

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
      onLogin: true
    };
    freedom.emit('recv-uid', data);
    freedom.emit('recv-status', "online");
       
  } else {
    freedom.emit('recv-status', "offline");
  }
}, function(err) {
  freedom.emit("recv-err", err);
});
