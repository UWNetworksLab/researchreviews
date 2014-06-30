//backend

// FreeDOM APIs
//var core = freedom.core();
//var social = freedom.socialprovider();
//var storage = freedom.storageprovider();
var store = freedom.localstorage();

function getPapers(newPaper){
  console.log("get paper");
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
    
    if(newPaper && typeof newPaper === "object") {
      console.log("pushing new paper");
      papers.push(newPaper);
      store.set('papers', JSON.stringify(papers)); 
    }

    console.log("papers length: " + papers.length);
    for(var i = 0; i < papers.length; i++)
      console.log("stored papers..." + papers[i].title + " key : " + papers[i].key); 

    freedom.emit('display-papers', papers);
  }); 
}

freedom.on('download-paper', function(data){
  console.log("downloadpaper");
  var promise = store.get('papers');
  promise.then(function(val) {

    var papers = JSON.parse(val);
    for(var i = 0; i < papers.length; i++){
      console.log("paperskey " + papers[i].key + " datakey: " + data.paperkey);
      if (papers[i].key.toString() === data.paperkey.toString()){
        console.log(papers[i].value);
        freedom.emit('got-paper', papers[i].binaryString);
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

freedom.on('load-papers', function(data) {
  console.log("on load papers");
  getPapers(); 
}); 