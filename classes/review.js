function Review(rdata) {
  this.title = rdata.title;
  this.pkey = rdata.pkey;
  this.author = rdata.author;
  this.vnum = rdata.vnum;
  this.text = rdata.text;
  this.accessList = rdata.accessList; 

  this.reviewer = rdata.reviewer;
  this.rkey = Math.random() + "";
  this.date = new Date();
}

Review.prototype.editReview = function(newText){
  this.text = newText;
};

//TOOD: privacy, delete, upload?
