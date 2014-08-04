//backend

var store = freedom.localstorage();
var social = freedom.socialprovider(); 
var myClientState = null;

var userList = []; 
var username; 

freedom.on('get-reviews', function(past) {
  var promise = store.get(username + 'reviews');
  promise.then(function(val) {
    var reviews; 
    try {
      reviews = JSON.parse(val);
    } catch(e) {}

    if(!reviews || typeof reviews !== "object") reviews = {};   

    for (var key in reviews){
      var rpast = (reviews[key].text) ? 1 : 0;
      if (rpast !== past){
        delete reviews[key];
      } 
    }

    freedom.emit('display-reviews', {
      reviews: reviews
    }); 
  }); 
}); 

freedom.on('get-saved-review-pp', function(pkey) {
  var promise = store.get(username + 'reviews');
  promise.then(function(val) {
    var reviews; 
    try {
      reviews = JSON.parse(val);
    } catch(e) {}

    if(!reviews || typeof reviews !== "object") reviews = {};  

    var index = -1; 
    for(key in reviews) {
      if(reviews[key].pkey == pkey)
        index = key; 
    }

    freedom.emit('display-saved-review', reviews[index]); 
  }); 
}); 

freedom.on('get-saved-review', function(rkey) {
  var promise = store.get(username + 'reviews');
  promise.then(function(val) {
    var reviews; 
    try {
      reviews = JSON.parse(val);
    } catch(e) {}

    if(!reviews || typeof reviews !== "object") reviews = {};   
    freedom.emit('display-saved-review', reviews[rkey]); 
  }); 
}); 

freedom.on('get-r-paper', function(data){
  social.sendMessage(data.to, JSON.stringify(data)).then(function(ret) {
  }, function(err) {
    freedom.emit("recv-err", err);
  });
});

freedom.on('add-review', function(review) {
  var promise = store.get(username + 'reviews');
  promise.then(function(val) {
    var reviews; 
    try {
      reviews = JSON.parse(val);
    } catch(e) {}

    if(!reviews || typeof reviews !== "object") reviews = {}; 

    reviews[review.rkey] = review; 
    store.set(username + 'reviews', JSON.stringify(reviews));
    freedom.emit('go-to-reviews', 0);
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
  if (parse.action === "get-paper-review"){
    var promise = store.get(username + 'reviews');
    promise.then(function(val) {
      var reviews; 
      try {
        reviews = JSON.parse(val);
      } catch(e) {}

      if(!reviews || typeof reviews !== "object") reviews = {}; 

      var msg = {
        action: 'got-paper-review',
        text: reviews[parse.rkey].text,
        reviewer: parse.reviewer
      };

      social.sendMessage(parse.author, JSON.stringify(msg));
    });
  }
  else if(parse.action === 'get-public-papers') {
    freedom.emit('got-public-papers', parse.papers);
  }
  else if (parse.action === "get-other-paper-review"){
    var promise = store.get(username + 'reviews');
    promise.then(function(val) {
      var reviews; 
      try {
        reviews = JSON.parse(val);
      } catch(e) {}

      if(!reviews || typeof reviews !== "object") reviews = {}; 

      var msg = {
        action: 'got-paper-review',
        text: reviews[parse.rkey].text,
        reviewer: parse.reviewer
      };

      if(reviews[parse.rkey].accessList !== 'public' && reviews[parse.rkey].accessList.indexOf(parse.from) == -1)
        msg.text = "You do not have access to this review."; 

      social.sendMessage(parse.from, JSON.stringify(msg));
    });
  }
  else if (parse.action === "got-paper-review"){
    freedom.emit('got-paper-review', parse);
  } 
  else if(parse.action === 'get-other-papers') {
    var promise = store.get(username + 'papers'); 
    promise.then(function(val) {
      var papers; 
      try {
        papers = JSON.parse(val); 
      } catch(e) {} 

      if(!papers || typeof papers !== "object") papers = {}; 

      var msg = {
        action: 'got-other-papers', 
        papers: papers 
      };

      social.sendMessage(parse.from, JSON.stringify(msg));
    }); 
  }
  else if(parse.action === 'get-browse-paper') {
    var promise = store.get(username + 'papers'); 
    promise.then(function(val) {
      var papers; 
      try {
        papers = JSON.parse(val); 
      } catch(e) {} 

      if(!papers || typeof papers !== "object") papers = {}; 

      var msg = {
        action: 'got-browse-paper', 
        paper: papers[parse.key]
      };

      social.sendMessage(parse.from, JSON.stringify(msg));
    }); 
  }
  else if(parse.action === 'got-other-papers') {
    freedom.emit('display-other-papers', parse.papers); 
  }
  else if(parse.action === 'got-browse-paper') {
    freedom.emit('display-browse-paper', parse.paper);
  }
  else if(parse.action === 'get-other-reviews') {
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
        action: 'got-other-reviews',
        reviews: reviews 
      };

      social.sendMessage(parse.from, JSON.stringify(msg));
    });
  }
  else if(parse.action === 'got-other-reviews') {
    freedom.emit('display-other-reviews', parse.reviews);
  }
  else if(parse.action === 'delete-r-paper') {
    //console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" + JSON.stringify(parse));
  }
  else if (parse.action === "invite-reviewer"){
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

      if(!reviews || typeof reviews !== "object") reviews = {}; 

      reviews[review.rkey] = review; 
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
      console.log(JSON.stringify(msg.version));
      social.sendMessage(parse.from, JSON.stringify(msg));
    });
  }
  else if(parse.action === 'send-r-paper') {
    freedom.emit('send-r-paper', parse.version);
  }
  else if (parse.action === 'add-review-on-author'){
    //TODO: now sending over binary string, only need to send key etc
    var promise = store.get(username + 'papers');
    promise.then(function(val) {
      var papers = JSON.parse(val);

      if (!papers[parse.pkey].versions[parse.vnum].reviews)
        papers[parse.pkey].versions[parse.vnum].reviews = [];
      
      papers[parse.pkey].versions[parse.vnum].reviews.push(parse);
      store.set(username + 'papers', JSON.stringify(papers)); 

    //alert author that their paper has been reviewed
      var alertmsg = {
        action: 'add-review-on-author',
        title: papers[parse.pkey].versions[parse.vnum].title,
        date: parse.date,
        vnum: parse.vnum, 
        reviewer: parse.reviewer   
      };
      freedom.emit('alert', alertmsg);
    });
  }  
});

freedom.on('get-paper-review', function(msg){
  msg.action = "get-paper-review";
  social.sendMessage(msg.reviewer, JSON.stringify(msg)).then(function(ret) {
  }, function(err) {
    freedom.emit("recv-err", err);
  });
});

freedom.on('get-other-paper-review', function(msg){
  msg.action = "get-other-paper-review";
  social.sendMessage(msg.reviewer, JSON.stringify(msg)).then(function(ret) {
  }, function(err) {
    freedom.emit("recv-err", err);
  });
});

freedom.on('get-other-papers', function(msg) {
  msg.action = "get-other-papers"; 
  social.sendMessage(msg.to, JSON.stringify(msg)).then(function(ret) {
  }, function(err) {
    freedom.emit("recv-err", err);
  });
}); 

freedom.on('get-browse-paper', function(msg) {
  msg.action = 'get-browse-paper'; 
  social.sendMessage(msg.author, JSON.stringify(msg)).then(function(ret) {
  }, function(err) {
    freedom.emit("recv-err", err);
  });  
});

freedom.on('get-other-reviews', function(msg) {
  msg.action = "get-other-reviews"; 
  social.sendMessage(msg.to, JSON.stringify(msg)).then(function(ret) {
  }, function(err) {
    freedom.emit("recv-err", err);
  });
}); 

freedom.on('upload-review', function(parse){
  var promise = store.get(username + 'reviews');
  promise.then(function(val) {
    var reviews; 
    try {
      reviews = JSON.parse(val);
    } catch(e) {}
    if(!reviews || typeof reviews !== "object") reviews = {}; 
    reviews[parse.rkey] = parse;
    reviews[parse.rkey].past = 1; 
    store.set(username + 'reviews', JSON.stringify(reviews));
    freedom.emit('update-my-review', JSON.stringify(parse));
  }); 

  //only info the author gets
  var reviewForAuth = {
    reviewer : parse.reviewer,
    rkey: parse.rkey,
    pkey: parse.pkey,
    vnum: parse.vnum,
    date: parse.date,
    accessList: parse.accessList, 
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
 var data = JSON.parse(msg); 
 var promise = store.get(username + 'papers');
  promise.then(function(val) {
    var papers; 
    try {
      papers = JSON.parse(val);
    } catch(e) {}

    if(!papers || typeof papers !== "object") {
      papers = {}; 
    } 

    for(key in papers) {
      if(key == data.key) {
        if(data.action === 'toPublic') { //change to public
          papers[key].versions[data.vnum].viewList = false; 
          papers[key].versions[data.vnum].privateSetting = false; 
        }
        else if(data.action === 'toPrivate'){ //change to private
          papers[key].versions[data.vnum].viewList = papers[key].versions[data.vnum].alertList; 
          papers[key].versions[data.vnum].privateSetting = true; 
        }
      }
    }

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

  //SHARE PAPER WITH USERS ALLOWED TO VIEW IT TODO: make this work for versioning
      var paper = {
        title: data.title,
        author: username,
        key: data.key, 
        vnum: data.vnum, 
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
        title: data.title, 
        author: username, 
        vnum: data.vnum, 
        key: data.key,
        action: 'invite-reviewer' 
      };

      for(var i = 0; i < data.alertList.length; i++) {
        social.sendMessage(data.alertList[i], JSON.stringify(msg)).then(function(ret) {
        }, function(err) {
          freedom.emit("recv-err", err);
        });
      }

    freedom.emit('display-new-version', papers[data.key]);
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