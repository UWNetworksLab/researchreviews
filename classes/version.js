function Version(vdata, file, paper, version) {
  if (version){
    this.vnum = version.vnum;
    this.author = version.author;
    this.comments = version.comments;
    this.pkey = version.pkey;
    this.viewList = version.viewList;
    this.alertList = version.alertList;
    this.privateSetting = version.privateSetting;
    this.reviews = version.reviews;
    this.date = version.date;
    this.title = version.title;
    this.binaryString = version.binaryString;
    return;
  }
  this.vnum = vdata.vnum;
  this.author = vdata.author;
  this.comments = vdata.comments;
  this.pkey = vdata.pkey;
  this.viewList = vdata.viewList;
  this.alertList = vdata.alertList;
  this.privateSetting = vdata.privateSetting;

  this.reviews = {};
  this.date = new Date();

  var reader = new FileReader();
  reader.onload = function() {
    var arrayBuffer = reader.result;
    this.title = file.name;
    this.binaryString = ab2str(arrayBuffer);
    paper.versions.push(this);

    if (this.vnum === 0) window.freedom.emit('add-paper', paper);
    else window.freedom.emit('add-version', this);
  }.bind(this);
  reader.readAsArrayBuffer(file);
}

Version.prototype.addReview = function(rkey, reviewer) {
  reviews[rkey] = reviewer;
};

Version.prototype.editPrivacy = function(publicSetting) {
  if (publicSetting){
    this.viewList = false; 
    this.privateSetting = false; 
  }
  else{
    this.viewList = this.alertList; 
    this.privateSetting = true; 
  }
};

Version.prototype.download = function(){
  var ab = str2ab(this.string);
  var reader = new FileReader();
  var blob = new Blob([ab], {type:'application/pdf'});

  reader.readAsArrayBuffer(blob);
  saveAs(blob, this.title);
};