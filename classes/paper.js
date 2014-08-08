function Paper(paper) {
  if (paper){
    this.pkey = paper.pkey; 
    this.versions = [];

    for (var i = 0; i < paper.versions.length; i++){
      this.versions.push(new Version(paper.versions[i], false, this));
    }

    this.author = username; 
    return;
  }
  this.pkey = Math.random() + ""; 
  this.versions = [];
  this.author = username;
}

Paper.prototype.addVersion = function(vdata, file) {
  vdata.author = this.author;
  vdata.pkey = this.pkey;
  vdata.vnum = this.versions.length;
  var version = new Version(vdata, file, this);
};

Paper.prototype.deleteVersion = function(vnum){
  this.versions.splice(vnum, 1);
};