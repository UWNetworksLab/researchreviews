function Paper(paper) {
  if (paper){ 
    console.log("IN PAPER " + JSON.stringify(paper));
    this.author = paper.author; 
    this.pkey = paper.pkey; 
    this.versions = [];
    for (var i = 0; i < paper.versions.length; i++){
    console.log("loop"+i);
      addVersion(new Version(paper.versions[i]));
    }
    return;
  }
  this.pkey = Math.random() + ""; 
  this.versions = [];
  this.author = username;
};

Paper.prototype.addVersion = function(version) {
  this.versions.push(version);
};

Paper.prototype.deleteVersion = function(vnum){
  this.versions.splice(vnum, 1);
};


