var social = freedom.socialprovider(); 

console.log("PUBLIC STORAGE.JS");

social.on('onMessage', function(data) { //from social.mb.js, onmessage
  console.log("public storage got here!!!!!!!!!!!!!!!!!!!!! " + data.message);
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
  console.log("logged in as public storage: " + JSON.stringify(ret));
}, function(err) {
  freedom.emit("recv-err", err);
});