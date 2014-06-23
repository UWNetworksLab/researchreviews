//backend

var core = freedom.core();
var social = freedom.socialprovider();
var storage = freedom.storageprovider();

var files = {};

freedom.on('add_paper', function(data) {
  console.log(data.key.toString());

  files[data.key] = {
    title: data.title, 
    value: data.value, 
    date: data.date 
  };

  freedom.emit('added_paper', data);
  var promise = storage.get('myPapers');
  promise.then(function(val) {
    var currPapers, prevCurrPapers;
    var newPaper = {}; 

    try {
      currPapers = JSON.parse(val);
      prevCurrPapers = JSON.parse(val); 
    } catch(e) {}  

    if (!currPapers || typeof currPapers !== "object") 
      currPapers = []; 

    newPaper.date = yyyy+'-'+mm+'-'+dd; 
    newPaper.title = data; 

    currPapers.push(newPaper);  

    for(var i = 0; i < currPapers.length; i++)
      console.log(currPapers[i].date + " AND " + currPapers[i].title); 

    if(currPapers !== prevCurrPapers)
      storage.set('myPapers', JSON.stringify(currPapers)); 

    freedom.emit('added_paper', currPapers); 

  }); 
}); 
freedom.on('delete_paper', function(paper) {
  console.log("deleting paper" + paper.title);

  var promise = storage.get('myPapers');
  promise.then(function(val) {
    var currPapers, prevCurrPapers;
    var newPaper = {};

    try {
      currPapers = JSON.parse(val);
      prevCurrPapers = JSON.parse(val); 
    } catch(e) {}  

    if (!currPapers || typeof currPapers !== "object") 
      currPapers = []; 

    for(var i = 0; i < currPapers.length; i++){
      if(currPapers[i].title === paper.title) {
        currPapers.splice(i, 1);
        break;
      }
    }
    storage.set('myPapers', JSON.stringify(currPapers));
  });
});
