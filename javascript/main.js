//backend

var store = freedom.localstorage();
//var social = freedom.socialprovider(); 
var storebuffer = freedom.storebuffer();
var socialWrap = new SocialTransport(
  [ freedom.socialprovider ], 
  [ freedom.transport ]
);
store.clear();
storebuffer.clear();

var myClientState = null;
var username = null;
var userList = []; 
var username; 

freedom.on('boot', function(val) {
  if(myClientState !== null) {
    if(myClientState.status == socialWrap.STATUS["ONLINE"]) {
      var data = {
        id: myClientState.userId, 
        onLogin: true,
        userList: userList
      };
      freedom.emit('recv-uid', data);
      freedom.emit('recv-status', "online");
    }
    else {
      freedom.emit('recv-status', "offline");
    }
  }
}); 

freedom.on('add-pdf', function(data){
  storebuffer.set(data.pkey+data.vnum +"", data.arrayBuffer);
});

freedom.on('download-pdf', function(data){
  var key = data.pkey + data.vnum + '';
  var promise = storebuffer.get(key);
  promise.then(function(val){
    if (val.byteLength) {
    }
    freedom.emit('got-pdf', val);
  });
});

freedom.on('get-reviews', function(past) {
  var promise = store.get(username + 'reviews');
  promise.then(function(val) {
    var reviews; 
    try {
      reviews = JSON.parse(val);
    } catch(e) {}

    if(!reviews || typeof reviews !== "object") reviews = [];   

    for (var i = reviews.length-1; i >=0; i--){
      var rpast = (reviews[i].text) ? 1 : 0;
      if (rpast !== past)
        reviews.splice(i, 1);
    }

    freedom.emit('display-reviews', reviews); 
  }); 
}); 

freedom.on('get-r-paper', function(data){//TODO check tag
  socialWrap.sendMessage(data.to, 'get-r-paper', JSON.stringify(data)).then(function(ret) {
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

socialWrap.on('onMessage', function(data) { //from social.mb.js, onmessage
  console.log("got to onmessage tag: " + data.tag);
  var parse = JSON.parse(socialWrap._ab2str(data.data));
  
  if (data.tag === "control-msg"){
    if (parse.action==='got-public-papers'){
      freedom.emit('got-public-papers', parse.papers);
    }
  }

  if (data.tag === "get-paper-review"){
    var promise = store.get(username + 'reviews');
    promise.then(function(val) {
      var reviews; 
      try {
        reviews = JSON.parse(val);
      } catch(e) {}

      if(!reviews || typeof reviews !== "object") reviews = []; 

      for(var i = 0; i < reviews.length; i++) {
        if(reviews[i].rkey === parse.rkey) {
          var msg = {
            text: reviews[i].text,
            reviewer: username 
          };
         if((reviews[i].accessList) && reviews[i].accessList.indexOf(parse.from) === -1)
            msg.text = "You do not have access to this review"; 
          socialWrap.sendMessage(parse.from, 'got-paper-review', JSON.stringify(msg));
          break;
        }
      }
    });
  }
  else if(data.tag === 'got-public-papers') {
    freedom.emit('got-public-papers', parse.papers);
  }
  else if (data.tag === "get-other-paper-review"){
    var promise = store.get(username + 'reviews');
    promise.then(function(val) {
      var reviews; 
      try {
        reviews = JSON.parse(val);
      } catch(e) {}

      if(!reviews || typeof reviews !== "object") reviews = []; 
      for (var i = 0; i < reviews.length; i++){
        if (reviews[i].rkey === parse.rkey){
          var msg = {
            text: reviews[i].text,
            accessList: reviews[i].accessList, 
            reviewer: parse.reviewer
          };

          if(reviews[i].accessList && reviews[i].accessList.indexOf(parse.from) === -1)
            msg.text = "You do not have access to this review."; 

          socialWrap.sendMessage(parse.from,'got-paper-review', JSON.stringify(msg));
          break;
        }
      }
    });
  }
  else if (data.tag === "got-paper-review"){
    freedom.emit('got-paper-review', parse);
  } 
  else if(data.tag === 'get-other-papers') {
    var promise = store.get(username + 'papers'); 
    promise.then(function(val) {
      var papers; 
      try {
        papers = JSON.parse(val); 
      } catch(e) {} 

      if(!papers || typeof papers !== "object") papers = {}; 

      var msg = {
        papers: papers 
      };

      socialWrap.sendMessage(parse.from, 'got-other-papers', JSON.stringify(msg));
    }); 
  }
  else if(data.tag === 'get-browse-paper') {
    var promise = store.get(username + 'papers'); 
    promise.then(function(val) {
      var papers; 
      try {
        papers = JSON.parse(val); 
      } catch(e) {} 

      if(!papers || typeof papers !== "object") papers = {}; 

      var msg;

      for(var i = 0; i < papers.length; i++) 
        if(papers[i].pkey === parse.pkey) {
          msg.paper = papers[i]; 
          break; 
        }
      socialWrap.sendMessage(parse.from,'got-browse-paper', JSON.stringify(msg));
    }); 
  }
  else if(data.tag === 'got-other-papers') {
    freedom.emit('display-other-papers', parse.papers); 
  }
  else if(data.tag === 'got-browse-paper') {
    freedom.emit('display-browse-paper', parse.paper);
  }
  else if(data.tag === 'get-other-reviews') {
    var promise = store.get(parse.to + 'reviews');
    promise.then(function(val) {
      var reviews; 
      try {
        reviews = JSON.parse(val);
      } catch(e) {}

      if(!reviews || typeof reviews !== "object") reviews = {}; 
      /*
      var allowReviews = []; 
      for(var key in reviews) {
        if(reviews[key].accessList.indexOf(parse.from) != -1)
          allowReviews.push(reviews[key]); 
      }*/ 

      var msg = {
        reviews: reviews 
      };

      socialWrap.sendMessage(parse.from,'got-other-reviews', JSON.stringify(msg));
    });
  }
  else if(data.tag === 'got-other-reviews') {
    freedom.emit('display-other-reviews', parse.reviews);
  }
  else if(data.tag === 'delete-r-paper') {
  }
  else if(data.tag === 'invite-group') {
    var alertmsg = {
      groupName: parse.name, 
      from: parse.from, 
      action: 'invite-group'
    };
    freedom.emit('alert', alertmsg);
  }
  else if (data.tag === "invite-reviewer"){
    var review = {
      title: parse.title, 
      pkey: parse.pkey,
      author: parse.author,
      vnum: parse.vnum, 
      rkey: Math.random() + "",
      reviewer: username 
    };

    //TODO: r_comments 
    var alertmsg = {
      action: 'invite-reviewer',
      title: parse.title,
      author: parse.author,
      vnum: parse.vnum  
    };
    freedom.emit('alert', alertmsg);

    var promise = store.get(username + 'reviews');
    promise.then(function(val) {
      var reviews; 
      try {
        reviews = JSON.parse(val);
      } catch(e) {}

      if(!reviews || typeof reviews !== "object") reviews = []; 

      reviews.push(review); 
      store.set(username + 'reviews', JSON.stringify(reviews)); 
    });
  }
  else if(data.tag === 'allow-access') {
    var promise = store.get(username+'private-papers');
    promise.then(function(val) {
      var papers; 
      try {
        papers = JSON.parse(val);
      } catch(e) {}
     if(!papers || typeof papers !== "object") papers = {}; 
      papers[parse.key] = parse; 
      store.set(username+'private-papers', JSON.stringify(papers)); 
    });
  }
  else if (data.tag === "get-profile"){
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
      profile.username = username; 
      socialWrap.sendMessage(parse.from,'got-profile', JSON.stringify(profile));
    });
  }
  else if (data.tag === "got-profile"){
    freedom.emit('display-profile', parse);
    var data = {
      id: parse.username, 
      onLogin: false 
    };
    freedom.emit('recv-uid', data); 
  }
//get our own papers to send back
  else if (data.tag === 'get-r-paper'){
  console.log("get-r-paper reached here xxxxxxxxxxx :D");
    var promise = store.get(username + 'papers');
    promise.then(function(val) {
      var papers = JSON.parse(val);
      var msg;

      for (var i = 0; i < papers.length; i++){
        if (papers[i].pkey === parse.pkey){
          var version = papers[i].versions[parse.vnum];
          if (version.privateSetting && version.viewList.indexOf(parse.from) === -1)
            msg.err = "You do not have access to this paper.";
          else msg.version = version;

          socialWrap.sendMessage(parse.from, 'send-r-paper', JSON.stringify(msg));
          return;
        }
      }
      msg.err = 'Paper has been deleted.'; 
      socialWrap.sendMessage(parse.from, JSON.stringify(msg));
    });
  }
  else if(data.tag === 'send-r-paper') {
    freedom.emit('send-r-paper', parse.version);
  }
  else if (data.tag === 'add-review-on-author'){
    var promise = store.get(username + 'papers');
    promise.then(function(val) {
      var papers = JSON.parse(val);

      for(var i = 0; i < papers.length; i++) 
        if(papers[i].pkey === parse.pkey) {
          var reviews = papers[i].versions[parse.vnum].reviews;
          if(!reviews) reviews=[];

          var index = -1; 
          if(reviews.length > 0)
            index = reviews.map(function(el) {
              return el.reviewer;
            }).indexOf(parse.reviewer); 

          if(index === -1) reviews.push(parse);
          else reviews[index] = parse;
          
          
          var alertmsg = {
            action: 'add-review-on-author',
            title: papers[i].versions[parse.vnum].title,
            date: parse.date,
            vnum: parse.vnum, 
            reviewer: parse.reviewer   
          };
          freedom.emit('alert', alertmsg);
          break; 
        }

      store.set(username + 'papers', JSON.stringify(papers)); 
    });
  }  
});

freedom.on('get-paper-review', function(msg){
  socialWrap.sendMessage(msg.reviewer,'get-paper-review', JSON.stringify(msg)).then(function(ret) {
  }, function(err) {
    freedom.emit("recv-err", err);
  });
});

freedom.on('get-other-paper-review', function(msg){
  socialWrap.sendMessage(msg.reviewer, 'get-other-paper-review', JSON.stringify(msg)).then(function(ret) {
  }, function(err) {
    freedom.emit("recv-err", err);
  });
});

freedom.on('get-other-papers', function(msg) {
  socialWrap.sendMessage(msg.to,'get-other-papers', JSON.stringify(msg)).then(function(ret) {
  }, function(err) {
    freedom.emit("recv-err", err);
  });
}); 

freedom.on('get-browse-paper', function(msg) {
  socialWrap.sendMessage(msg.author,'get-browse-paper', JSON.stringify(msg)).then(function(ret) {
  }, function(err) {
    freedom.emit("recv-err", err);
  });  
});

freedom.on('get-other-reviews', function(msg) {
  socialWrap.sendMessage(msg.to, 'get-other-reviews', JSON.stringify(msg)).then(function(ret) {
  }, function(err) {
    freedom.emit("recv-err", err);
  });
}); 

freedom.on('set-review', function(review) {
  var promise = store.get(username + 'reviews');
  promise.then(function(val) {
    var reviews; 
    try {
      reviews = JSON.parse(val);
    } catch(e) {}

    if(!reviews || typeof reviews !== "object") reviews = []; 

    var exists = false;
    for (var i = 0; i < reviews.length; i++){
      if (reviews[i].rkey === review.rkey){
        reviews[i] = review;
        exists = true;
      }
    }
    if (!exists) {
      reviews.push(review); 
    }
    store.set(username + 'reviews', JSON.stringify(reviews));
  });
}); 

freedom.on('edit-privacy', function(msg){
  socialWrap.sendMessage("publicstorage", msg).then(function(ret) {
  }, function(err) {
    freedom.emit("recv-err", err);
  });
});

freedom.on('upload-review', function(parse){//rename this to indicate this is sending to author
  //only info the author gets
  var reviewForAuth = {
    reviewer : parse.reviewer,
    rkey: parse.rkey,
    pkey: parse.pkey,
    vnum: parse.vnum,
    date: parse.date,
    accessList: parse.accessList 
  };

  socialWrap.sendMessage(parse.author,'add-review-on-author', JSON.stringify(reviewForAuth)).then(function(ret) {
  }, function(err) {
    freedom.emit("recv-err", err);
  });
});

freedom.on('send-message', function(val) {
  socialWrap.sendMessage(val.to, val.msg).then(function(ret) {
  }, function(err) {
    freedom.emit("recv-err", err);
  });
});

socialWrap.on('onUserProfile', function(data) {
  if(data.userId !== 'publicstorage' && 
    data.userId !== username) 
    userList.push(data.userId); 
  freedom.emit('new-user', data.userId);
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
  if (data === username){
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
      from: username
    };
    socialWrap.sendMessage(data,'get-profile', JSON.stringify(message)).then(function(ret) {
    }, function(err) {
      freedom.emit("recv-err", err);
    });
  }
});

freedom.on('share-version', function(data) {
   var paper = {
        title: data.title,
        author: username,
        pkey: data.pkey, 
        vnum: data.vnum,
        action: 'add-paper'
      };

      if(!data.privateSetting){
      //public (send paper to public storage) 
        console.log("PAEPR IN MAIN " + JSON.stringify(paper));

        var pString = JSON.stringify(paper);
        var buf = socialWrap._str2ab(pString);

        socialWrap.sendMessage('publicstorage', 'control-msg', buf).then(function(ret) {
        }, function(err) {
          freedom.emit("recv-err", err);
        });
      }
      
      else { //private (send private paper to viewList)
        for(var i = 0; i < data.viewList.length; i++) {
          socialWrap.sendMessage(data.viewList[i], 'add-paper', JSON.stringify(paper)).then(function(ret) {
          }, function(err) {
            freedom.emit("recv-err", err);
          });
        }
      }
/*
      //SHARE PAPER WITH REVIEWERS
      var msg = {
        title: data.title, 
        author: username, 
        vnum: data.vnum, 
        pkey: data.pkey
      };

      for(var i = 0; i < data.alertList.length; i++) {
        socialWrap.sendMessage(data.alertList[i], 'invite-reviewer', JSON.stringify(msg)).then(function(ret) {
        }, function(err) {
          freedom.emit("recv-err", err);
        });
      }*/
}); 

freedom.on('set-reviews', function(reviews) {
  store.set(username+'reviews', JSON.stringify(reviews)); 
}); 

freedom.on('set-papers', function(papers) {
  store.set(username+'papers', JSON.stringify(papers)); 
}); 

freedom.on('get-papers', function(data) {
  var promise = store.get(username + 'papers');
  promise.then(function(val) {
    var papers; 
    try {
      papers = JSON.parse(val);
    } catch(e) {}

    if(!papers || typeof papers !== "object") {
      papers = []; 
    }
    freedom.emit('display-papers', papers);
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
    action: 'get-public-papers'
  };

  var buf = socialWrap._str2ab(JSON.stringify(message));

  socialWrap.sendMessage("publicstorage", 'get-public-papers', buf).then(function(ret) {
  }, function(err) {
    freedom.emit("recv-err", err);
  });
});

freedom.on('delete-paper', function(data){
    socialWrap.sendMessage("publicstorage",'delete-paper', JSON.stringify(data)).then(function(ret) {
    }, function(err) {
      freedom.emit("recv-err", err);
    });
});

socialWrap.login({
  agent: 'rr', 
  version: '0.1',
  url: '',
  interactive: true,
  rememberLogin: false
}).then(function(ret) {
  myClientState = ret;
  username = ret.userId; 
  if (ret.status == socialWrap.STATUS["ONLINE"]) {
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
