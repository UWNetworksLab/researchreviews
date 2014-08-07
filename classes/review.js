function Review(rdata) {
  this.ptitle = rdata.title;
  this.pkey = rdata.pkey;
  this.author = rdata.author;
  this.vnum = rdata.vnum;
  this.text = rdata.text;

  this.reviewer = username;
  this.rkey = Math.random() + "";
  this.date = new Date();
}

Review.prototype.editReview = function(newText){
  this.text = newText;
};