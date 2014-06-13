//backend

var store = freedom.localstorage(); 

freedom.on('add_paper', function(data) {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; 
  var yyyy = today.getFullYear();

  var promise = store.get('myPapers');
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
      store.set('myPapers', JSON.stringify(currPapers)); 

    freedom.emit('added_paper', currPapers); 
  }); 
});



