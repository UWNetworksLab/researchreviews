function Paper(paper) {
  if (paper){
    this.pkey = paper.pkey; 
    this.versions = paper.versions;
    this.author = username; 
    return;
  }
  this.pkey = Math.random() + ""; 
  this.versions = [];
  this.author = username;
}

Paper.prototype.addVersion = function(vdata, file) {
  var version = new Version(vdata, file, this);
};

Paper.prototype.deleteVersion = function(vnum){
  this.versions.splice(vnum, 1);
};

function toPaper(obj){
  var paper = new Paper();
  paper.pkey = obj.pkey;
  paper.author = obj.author;
  paper.date = obj.date;
  paper.versions = obj.versions;
  return paper;
}