//backend

var core = freedom.core();
var social = freedom.socialprovider();
var storage = freedom.storageprovider();

var myClientState = null;
var files = {};       // Files served from this node
var fetchQueue = [];  // Files on queue to be downloaded

var connections = {};

function setupConnection(name, key) {
  console.log("set up connection with " + name + " " + key);
  connections["johndoe"] = freedom.transport();
  connections["johndoe"].on('onData', function(message) {
    console.log("Receiving data with tag: " + message.tag);
    social.sendMessage(targetId, JSON.stringify({
      cmd: 'done',
      data: key
    }));
    freedom.emit('download-data', message.data);
  });
  return core.createChannel().then(function (chan) {
    // Set up the signalling channel first, it may be needed in the
    // peerconnection setup.
    chan.channel.on('message', function(msg) {
      social.sendMessage("johndoe", JSON.stringify({
        cmd: 'signal',
        data: msg
      }));
    });
    signallingChannels["johndoe"] = chan.channel;
    return connections["johndoe"].setup(name, chan.identifier);
  });
}

function fetch(data) {
  //@todo smarter way to choose a target in the future
  var key = data.key;
  
  console.log("fetch: downloading " + key);
  //Tell 'em I'm comin' for them
  social.sendMessage(JSON.stringify({
    cmd: 'fetch',
    data: key
  }));
  setupConnection("fetcher", key);
}

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

freedom.on('download', function(data) {
  console.log("on download"); 
  if (myClientState !== null && 
      myClientState.status == social.STATUS["ONLINE"]) {
    fetch(data);
  } else {
    fetchQueue.push(data);
  }
});


social.on('onMessage', function(data) {
  var msg;
  var targetId;
  var key;

  // Try parsing message
  try {
    msg = JSON.parse(data.message);
  } catch (e) {
    console.log("Error parsing message: " + data);
    return;
  }
  
  if (data.from.clientId && msg.cmd && msg.data && msg.cmd == 'fetch') {
    key = msg.data;
    targetId = data.from.clientId;
    updateStats(key, 1, 0);

    console.log("social.onMessage: Received request for " + key + " from " + targetId);
    setupConnection("server-"+targetId, targetId).then(function(){ //SEND IT
      if (files[key] && files[key].data) {
        console.log("social.onMessage: Sending " + key + " to " + targetId);
        connections[targetId].send('filedrop', files[key].data);
      } else {
        console.log("social.onMessage: I don't have key: " + key);
        social.sendMessage(targetId, JSON.stringify({
          cmd: 'error',
          data: 'File missing!'
        }));
      }
    });
  } else if (data.from.clientId && msg.cmd && msg.data && msg.cmd == 'done') {
    key = msg.data;
    updateStats(key, -1, 1);
  } else if (data.from.clientId && msg.cmd && msg.data && msg.cmd == 'signal') {
    console.log('social.onMessage: signalling message');
    targetId = data.from.clientId;
    if (signallingChannels[targetId]) {
      signallingChannels[targetId].emit('message', msg.data);
    } else {
      //DEBUG
      console.error("Signalling channel missing!!");
    }
  } else if (data.from.clientId && msg.cmd && msg.data && msg.cmd == 'error') {
    console.log('social.onMessage: ' + msg.data);
    freedom.emit('download-error', msg.data);
  } else {
    console.log("social.onMessage: Unrecognized message: " + JSON.stringify(data));
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
    console.log("fetch q len: " + fetchQueue.length); 
    while (fetchQueue.length > 0) {
      fetch(fetchQueue.shift());
    }
  } else {
    freedom.emit("serve-error", "Failed logging in. Status: "+ret.status);
  }
}, function(err) {
  freedom.emit("serve-error", err.message); 
});