var social = freedom.socialprovider(); 
var store = freedom.localstorage();

social.on('onMessage', function(data) { //from social.mb.js, onmessage
  var parse = JSON.parse(data.message);
  console.log("data.message" + parse.action);

  if (parse.action === 'get-public-papers'){
    console.log('get-public-papers');

    var promise = store.get('public-papers');
    promise.then(function(val) {
      var papers; 
      try {
        papers = JSON.parse(val);
      } catch(e) {}

      if(!papers || typeof papers !== "object") {
        console.log("nothing in papers");
        papers = []; 
      }

      var msg = {
        papers: papers,
        action: 'get-public-papers'
      };

      social.sendMessage(parse.username, JSON.stringify(msg)).then(function(ret) {
        console.log('sent message back to ' + parse.username + JSON.stringify(msg));
        //Fulfill - sendMessage succeeded
      }, function(err) {
        freedom.emit("recv-err", err);
      });
    });
  }

  else if (parse.action === 'add-paper'){
    console.log("public storage got here!!!!!!!!!!!!!!!!!!!!! " + data.message);
    var promise = store.get('public-papers');
    promise.then(function(val) {
      var papers; 
      try {
        papers = JSON.parse(val);
      } catch(e) {}

     if(!papers || typeof papers !== "object") {
        console.log("nothing in papers");
        papers = []; 
      }
      papers.push(parse.title);
      store.set('public-papers', JSON.stringify(papers)); 
      });
  }
});

/*social.sendMessage(val.to, val.msg).then(function(ret) {
  console.log(val.to + val.from + val.msg);
  //Fulfill - sendMessage succeeded
}, function(err) {
  freedom.emit("recv-err", err);å
});*/ 

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