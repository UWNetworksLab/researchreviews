//backend

var core = freedom.core();
var social = freedom.socialprovider();
var storage = freedom.storageprovider();

var myClientState = null;
var files = {};       // Files served from this node
var fetchQueue = [];  // Files on queue to be downloaded

freedom.on('serve-data', function(data) {
  if (!data.key || !data.value) {
    console.log('serve-data: malformed request ' + JSON.stringify(data));
    return;
  }
  console.log('serve-data: now serving ' + data.key + " " + data.name + " " + data.value);
  files[data.key] = {
    data: data.value
  };
  if (myClientState.status == social.STATUS["ONLINE"]) {
    console.log("emit serve-descriptor");
    freedom.emit('serve-descriptor', {
      key: data.key,
      name: data.name
    });
  } else {
    freedom.emit('serve-error', "Error connecting to server.");
  }
});

console.log('Logging in to social API');
social.login({
  agent: 'researchreviews', 
  version: '0.1', 
  url: '',
  interactive: true,
  rememberLogin: false
}).then(function(ret) {
  myClientState = ret;
  if (ret.status == social.STATUS["ONLINE"]) {
    console.log('social.onStatus: ONLINE!');
    while (fetchQueue.length > 0) {
      fetch(fetchQueue.shift());
    }
  } else {
    freedom.emit("serve-error", "Failed logging in. Status: "+ret.status);
  }
}, function(err) {
  freedom.emit("serve-error", err.message); 
});