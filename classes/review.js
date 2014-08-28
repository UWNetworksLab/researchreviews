function Review(rdata) {
  this.title = rdata.title;
  this.pkey = rdata.pkey;
  this.author = rdata.author;
  this.vnum = rdata.vnum;
  this.text = rdata.text;
  this.accessList = rdata.accessList; 

  this.reviewer = rdata.reviewer;
  this.rkey = rdata.rkey;
  this.date = new Date();
  this.responses = rdata.responses;
}

Review.prototype.editReview = function(newText){
  this.text = newText;
};

//TOOD: privacy, delete, upload?

Review.prototype.respond = function(rText){
  console.log("got here in respond " + rText);
  
  if (!this.responses) this.responses = [];
  var str = username + ": " + rText; 
  this.responses.push(str);



  var msg = {
    reviewer: this.reviewer,
    rkey: this.rkey,
    response: str
  };

  window.freedom.emit('add-r-response', msg);
};
