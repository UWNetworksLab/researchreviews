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
        action: 'get-public-papers'
      };

      social.sendMessage(parse.username, JSON.stringify(msg)).then(function(ret) {
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
      console.log("asdfasdkjfalsdkjfalsdkjfhalskdjfhlaksjdfhlaskdjhfaldsjkf private setting " + JSON.stringify(papers));
        for (var i = 0; i < papers.length; i++){
        console.log("KEYS XXXXXXXXXX " + papers[i].pkey + " " + parse.pkey);
          if (papers[i].pkey === parse.pkey){
          console.log("SPLICED FOR KEY " + parse.pkey + " " + papers[i].pkey);
            papers.splice(i, 1);
          }
        }        
      }
      else {
      console.log("asdhflaksjdfhlajsdfhlasjdkfhalsdkjfh oubis setting");
        papers.push(parse);
      }
      store.set('public-papers', JSON.stringify(papers)); 
    });
  }

  else if (parse.action === 'add-paper'){
  console.log("ADD PAPER HERE ASDFASDASDFASDFLASDJFALKSDFJALSKDFJALSKDFJL");
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
        if(papers[i].key == parse.key) {
          var paper = papers[i].versions[parse.vnum]; 
          paper.comments = ""; 
          paper.title = "Deleted."; 
          paper.binaryString = ""; 
          paper.reviews = []; 
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
