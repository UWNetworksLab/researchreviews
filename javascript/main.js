//backend

// FreeDOM APIs
//var core = freedom.core();
//var social = freedom.socialprovider();
//var storage = freedom.storageprovider();
var store = freedom.localstorage();

// Internal State
//var myClientState = null;
//var userList = {};
//var clientList = {};
var files = {};       // Files served from this node
//var fetchQueue = [];  // Files on queue to be downloaded*/ 

// PC
var connections = {};
var signallingChannels = {};

function getPapers(newPaper){
  var papers = [];
  var promise = store.get('papers');
  promise.then(function(val) {
    try {
      papers = JSON.parse(val);

      if(newPaper || typeof newPaper === "object") {
        papers.push(newPaper);
        store.set('papers', JSON.stringify(papers)); 
      }

      for(var i = 0; i < papers.length; i++)
        console.log("stored papers..." + papers[i].title); 
    } catch(e) {}
    freedom.emit('display-papers', papers);
  }); 
}

freedom.on('add-paper', function(data) {
  files[data.key] = {
    title: data.title, 
    value: data.value, 
    date: data.date 
  };
  getPapers(data);
}); 

freedom.on('load-papers', function(data) {
  getPapers(); 
}); 

