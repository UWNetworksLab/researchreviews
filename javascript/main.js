//backend

var store = freedom.localstorage();
var social = freedom.socialprovider(); 
var myClientState = null;

//store.set('papers', []);
 
freedom.on('download-version', function(data){
  console.log("download version");
  var promise = store.get('papers');
  promise.then(function(val) {
    var papers = JSON.parse(val);
    for(var i = 0; i < papers.length; i++){
      if (papers[i].key.toString() === data.key.toString()){
        console.log("download paper title: " + papers[i].versions[data.vnum].title); 
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
  var promise = store.get('papers');
  promise.then(function(val) {
    console.log("in promise");
    var papers; 
    try {
      papers = JSON.parse(val);
    } catch(e) {}

    if(!papers || typeof papers !== "object") {
      console.log("nothing in papers");
      papers = []; 
    }

    if(data.key) { //add new version
      console.log("pushing new version");

      for(var i = 0; i < papers.length; i++)
        if(papers[i].key == data.key) {
          data.vnum = papers[i].versions.length; 
          papers[i].versions.push(data); 
          break;
        }

      store.set('papers', JSON.stringify(papers)); 
      freedom.emit("display-new-version", papers[i]);
    }
    else { //add new paper
      data.vnum = 0;
      data.key = Math.random() + ""; 

      var newPaper = {
        key: data.key, 
        versions: [data] 
      };

      console.log("pushing new paper: " + newPaper.key); 
      console.log("new paper versions: " + newPaper.versions[0].title);

      papers.push(newPaper); 

      store.set('papers', JSON.stringify(papers)); 
      freedom.emit('display-new-paper', newPaper);
    }
  }); 
}); 

freedom.on('get-paper-view', function(data) {
  console.log("find paper: " + data.key);

  var promise = store.get('papers');
  promise.then(function(val) {
    console.log("in promise");
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
        console.log("DATA VNUM: " + data.vnum + " num of versions: " + papers[i].versions.length);
        if(data.vnum == -1) { //from clicking paper table
          console.log("if statement 1");
          var action = 1;
          if (papers[i].versions.length == 1) action = 0;
          freedom.emit("got-paper-view", {version: papers[i].versions[papers[i].versions.length-1], action: action});
        }
        else if(data.vnum > 0 && data.vnum < papers[i].versions.length-1) { //clicking prev and next, version exists
          console.log("get-paper view...vnum: " + data.vnum + " num of versions: " + papers[i].versions.length);
          freedom.emit("got-paper-view", {version: papers[i].versions[data.vnum]});
        }
        else if(data.vnum == 0) { //if number disable
          console.log("got -1");
          freedom.emit("got-paper-view", {version: papers[i].versions[0], action: -1});
        }
        else if(data.vnum >= papers[i].versions.length-1){
          console.log("got 1");
          freedom.emit("got-paper-view", {version: papers[i].versions[papers[i].versions.length-1], action: 1});          
        }
        break;
      }
    }
  });  
});

freedom.on('load-papers', function(data) {
  var promise = store.get('papers');
  promise.then(function(val) {
    console.log("in promise");
    var papers; 
    try {
      papers = JSON.parse(val);
    } catch(e) {}

    if(!papers || typeof papers !== "object") {
      console.log("nothing in papers");
      papers = []; 
    }

    freedom.emit('display-table-and-view', papers); 
  }); 
});

freedom.on('delete-paper', function(key){
  console.log("on delete-paper");
  var promise = store.get('papers');
  promise.then(function(val) {
    var papers; 
    try {
      papers = JSON.parse(val);
    } catch(e) {}

    console.log("deleting papers");
    for(var i = 0; i < papers.length; i++){
      if(papers[i].key == key) {
        papers.splice(i, 1);
        break;
      }
    }
    store.set('papers', JSON.stringify(papers)); 
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
  console.log("state: " + JSON.stringify(myClientState));
  if (ret.status == social.STATUS["ONLINE"]) {
    freedom.emit('recv-uid', ret.userId);
    freedom.emit('recv-status', "online");
    
  } else {
    freedom.emit('recv-status', "offline");
  }
}, function(err) {
  freedom.emit("recv-err", err);
});