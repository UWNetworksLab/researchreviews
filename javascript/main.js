//backend

// FreeDOM APIs
//var core = freedom.core();
//var social = freedom.socialprovider();
//var storage = freedom.storageprovider();
var store = freedom.localstorage();

//store.set('papers', []);
 
function processPapers(paperAction, data){
  console.log("process papers");
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

    if(paperAction == 0) {
      freedom.emit('display-paper-table', papers);
    }
    else if(paperAction == 1) {
      console.log("pushing new paper");
      papers.push(data);
      key = data.key;
      store.set('papers', JSON.stringify(papers)); 
      freedom.emit('display-papers', {value: data, paperAction: paperAction, key: data.key});
    }
    else if (paperAction == -1) {
      console.log("deleting papers");
      for(var i = 0; i < papers.length; i++){
        if(papers[i].key == data) {
          papers.splice(i, 1);
          break;
        }
      }
      store.set('papers', JSON.stringify(papers)); 
      freedom.emit('display-papers', {value: 0, paperAction: -1, key: data});
    }
  }); 
}

freedom.on('download-paper', function(data){
  console.log("downloadpaper");
  var promise = store.get('papers');
  promise.then(function(val) {
    var papers = JSON.parse(val);
    for(var i = 0; i < papers.length; i++){
      if (papers[i].key.toString() === data.toString()){
        freedom.emit('got-paper', {
          string: papers[i].binaryString, 
          title: papers[i].title
        });
        break;
      }
    }
  });
});

freedom.on('show-paper', function(key) {
  var promise = store.get('papers');
  promise.then(function(val) {
    var papers = JSON.parse(val);
  
    if(papers.length == 0) {
      freedom.emit('show-paper-view', -1);
      return; 
    }
    if(key == -1) {
      freedom.emit('show-paper-view', papers[0]); 
      return; 
    }
    for(var i = 0; i < papers.length; i++){
      if (papers[i].key.toString() === key.toString()){
        freedom.emit('show-paper-view', papers[i]); 
        break;
      } 
    }
  }); 
}); 

freedom.on('add-paper', function(data) {
  var dd = data.date.getDate();
  var mm = data.date.getMonth()+1; 
  var yyyy = data.date.getFullYear();
  data.date = yyyy+'-'+mm+'-'+dd; 
  console.log("on add paper: " + data.title + " " + data.date); 

  processPapers(1, data);
}); 

freedom.on('delete-paper', function(key){
  console.log("on delete-paper");
  processPapers(-1, key); 
});

freedom.on('load-papers', function(data) {
  console.log("on load papers"); 
  processPapers(0); 
}); 