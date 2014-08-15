var social = freedom.socialprovider(); 
var store = freedom.localstorage();
store.clear();
social.on('onMessage', function(data) { //from social.mb.js, onmessage
  console.log("DATA MESSAGE " + data.message);
  var parse = JSON.parse(data.message);

  if (parse.action === 'get-public-papers'){
    var promise = store.get('public-papers');
    promise.then(function(val) {
      var papers; 
      try {
        papers = JSON.parse(val);
      } catch(e) {}

      if(!papers || typeof papers !== "object") {
        papers = []; 
      }

      var msg = {
        papers: papers,
        action: 'got-public-papers'
      };

      social.sendMessage(parse.from, JSON.stringify(msg)).then(function(ret) {
      }, function(err) {
        freedom.emit("recv-err", err);
      });
    });
  }

  else if (parse.action === 'edit-privacy'){
    console.log("edit privacy "+ data);
    var promise = store.get('public-papers');
    promise.then(function(val) {
      var papers; 
      try {
        papers = JSON.parse(val);
      } catch(e) {}

     if(!papers || typeof papers !== "object") {
        papers = []; 
      }

      if (parse.privateSetting){
        for (var i = 0; i < papers.length; i++){
          if (papers[i].pkey === parse.pkey){
            papers.splice(i, 1);
          }
        }        
      }
      else {
        papers.push(parse);
      }
      store.set('public-papers', JSON.stringify(papers)); 
    });
  }

  else if (parse.action === 'add-paper'){
    var promise = store.get('public-papers');
    promise.then(function(val) {
      var papers; 
      try {
        papers = JSON.parse(val);
      } catch(e) {}

     if(!papers || typeof papers !== "object") {
        papers = []; 
      }
      papers.push(parse);
      store.set('public-papers', JSON.stringify(papers)); 
    });
  }

  else if (parse.action === 'delete-paper'){
  console.log("delete paper in here public storage " + JSON.stringify(parse));
    var promise = store.get('public-papers');
    promise.then(function(val) {
      var papers; 
      try {
        papers = JSON.parse(val);
      } catch(e) {}

     if(!papers || typeof papers !== "object") {
        papers = []; 
      }
      
      for(var i = 0; i < papers.length; i++)
        if(papers[i].pkey == parse.pkey) {
          papers.splice(i, 1);
          break; 
        }

      store.set('public-papers', JSON.stringify(papers)); 
    });
  }
});

social.login({
  agent: 'rr', 
  version: '0.1',
  url: "publicstorage",
  interactive: false,
  rememberLogin: false
}).then(function(ret) {
}, function(err) {
  freedom.emit("recv-err", err);
});
