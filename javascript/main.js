//backend

// FreeDOM APIs
//var core = freedom.core();
//var social = freedom.socialprovider();
//var storage = freedom.storageprovider();
var store = freedom.localstorage();

//store.set('papers', []);

function getPapers(newPaper){
  console.log("get paper");
  var promise = store.get('papers');
  promise.then(function(val) {
    var paperAction = 0; 
    var key = -1;

    console.log("in promise");
    var papers; 
    try {
      papers = JSON.parse(val);
    } catch(e) {}

    if(!papers || typeof papers !== "object") {
      console.log("nothing in papers");
      papers = []; 
    }
    
    if(newPaper && typeof newPaper === "object") {
      console.log("pushing new paper");
      papers.push(newPaper);
      store.set('papers', JSON.stringify(papers)); 
      paperAction = 1;
      key = newPaper.key;
    }

    console.log("papers length: " + papers.length);
/*    for(var i = 0; i < papers.length; i++)
      console.log("stored papers..." + papers[i].title + " key : " + papers[i].key); 
*/
    if (paperAction == 0) freedom.emit('display-default-papers', papers);
    else freedom.emit('display-papers', {value: newPaper, paperAction: paperAction, key: key});
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

  getPapers(data);
}); 

freedom.on('delete-paper', function(key){

  console.log("on delete-paper");
  var promise = store.get('papers');
  promise.then(function(val) {
    var papers = JSON.parse(val);
    for(var i = 0; i < papers.length; i++){
      console.log("papers key" +  papers[i].key + " key " + key);
      if(papers[i].key == key) {
        papers.splice(i, 1);
        break;
      }
    }
    store.set('papers', JSON.stringify(papers)); 
    console.log("papers length: " + papers.length);
    for(var i = 0; i < papers.length; i++)
      console.log("stored papers..." + papers[i].title + " key : " + papers[i].key); 

    freedom.emit('display-papers', {value: 0, paperAction: -1, key: key});
  });
});

freedom.on('load-papers', function(data) {
  console.log("on load papers");
  getPapers(); 
}); 