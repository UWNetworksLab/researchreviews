function Review(rdata) {
  this.ptitle = rdata.ptitle;
  this.pkey = rdata.pkey;
  this.author = rdata.author;
  this.vnum = rdata.vnum;
  this.text = rdata.text;

  this.reviewer = rdata.reviewer;
  this.rkey = Math.random() + "";
  this.date = new Date();
}

Review.prototype.editReview = function(newText){
  this.text = newText;
};

//TOOD: privacy, delete, upload?