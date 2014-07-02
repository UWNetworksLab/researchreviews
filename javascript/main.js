//backend

// FreeDOM APIs
//var core = freedom.core();
//var social = freedom.socialprovider();
//var storage = freedom.storageprovider();
var store = freedom.localstorage();

//store.set('papers', []);
 
/*function processPapers(paperAction, data){
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
}*/ 

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

/*freedom.on('show-paper', function(key) {
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
}); */ 

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

freedom.on('find-paper', function(data) {
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

    for(var i = 0; i < papers.length; i++)
      if(papers[i].key == data.key) {
        if(!data.vnum) {
          freedom.emit("found-paper", papers[i].versions[papers[i].versions.length-1]);
        }
        else if(data.vnum >= 0 || data.vnum < papers[i].versions.length) 
          freedom.emit("found-paper", papers[i].versions[data.vnum]);
        break;
      }    
  });  
});

freedom.on('get-paper-table', function(data) {
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

    freedom.emit('display-paper-table', papers); 
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




/*
freedom.on('load-papers', function(data) {
  console.log("on load papers"); 
  processPapers(0); 
}); */