//backend

var store = freedom.localstorage();
var social = freedom.socialprovider(); 
var myClientState = null;

var userList = []; 
var messageList = []; 

//store.set('papers', []);

freedom.on('load-alerts', function(data){
  console.log("load alerts messagelist "+ JSON.stringify(messageList));
  freedom.emit('got-alerts', JSON.stringify(messageList));
});

social.on('onMessage', function(data) { //from social.mb.js, onmessage
  var parse = JSON.parse(data.message);
  if (parse.action === "invite-reviewer"){
    messageList.push(parse); 
//    parse.num_msg = messageList.length;
  }
  console.log("data in main " + data.message);
  freedom.emit('recv-message', JSON.stringify(parse));    

});

freedom.on('send-message', function(val) {
  social.sendMessage(val.to, val.msg).then(function(ret) {
    console.log(val.to + val.from + val.msg);
    //Fulfill - sendMessage succeeded
  }, function(err) {
    freedom.emit("recv-err", err);
  });
});

social.on('onUserProfile', function(data) {
  userList.push(data.userId); 
});
 
freedom.on('get-users', function(data) {
  freedom.emit('send-users', userList);
}); 

freedom.on('download-version', function(data){
  var promise = store.get(username + 'papers');
  promise.then(function(val) {
    var papers = JSON.parse(val);
    for(var i = 0; i < papers.length; i++){
      if (papers[i].key.toString() === data.key.toString()){
        freedom.emit('got-paper', {
          string: papers[i].versions[data.vnum].binaryString, 
          title: papers[i].versions[data.vnum].title
        });
        break;
      }
    }
  });
});

freedom.on('add-paper', function(data) {
  var promise = store.get(username + 'papers');
  promise.then(function(val) {
    var papers; 
    try {
      papers = JSON.parse(val);
      console.log("papers length before adding new paper: " + papers.length);
    } catch(e) {}

    if(!papers || typeof papers !== "object") {
      console.log("nothing in papers");
      papers = []; 
    }

    if(data.key) { //add new version
      for(var i = 0; i < papers.length; i++)
        if(papers[i].key == data.key) {
          data.vnum = papers[i].versions.length; 
          papers[i].versions.push(data); 
          break;
        }

      store.set(username + 'papers', JSON.stringify(papers)); 
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
      console.log('papers length after: ' + papers.length);


      var promise = store.get(username + 'papers');
      promise.then(function(val) {
        var gotpapers; 
        try {
          gotpapers = JSON.parse(val);
        } catch(e) {}

        console.log("in promise papers.length: " + papers.length);

      }); 

      var paper ={
        title: newPaper.versions[0].title,
        author: username,
        action: 'add-paper'
      };

      social.sendMessage("publicstorage", JSON.stringify(paper)).then(function(ret) {
      }, function(err) {
        freedom.emit("recv-err", err);
      });

      store.set(username+'papers', JSON.stringify(papers)); 

      freedom.emit('display-new-paper', newPaper);
    }
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

    if(!papers || typeof papers !== "object") {
      papers = []; 
      console.log("nothing");
    }

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
    freedom.emit('recv-uid', ret.userId);
    freedom.emit('recv-status', "online");
       
  } else {
    freedom.emit('recv-status', "offline");
  }
}, function(err) {
  freedom.emit("recv-err", err);
});