function Version(vdata) {
  this.comments = vdata.comments;
  this.viewList = vdata.viewList;
  this.alertList = vdata.alertList;
  this.privateSetting = vdata.privateSetting;

  this.reviews = vdata.reviews? vdata.reviews : [];
  this.date = new Date();

  this.author = vdata.author;
  this.pkey = vdata.pkey;
  this.vnum = vdata.vnum; 
  this.title = vdata.title;  
}

Version.prototype.addReview = function(rkey, reviewer) {
  reviews[rkey] = reviewer;
};

Version.prototype.uploadPDF = function(file){
  console.log("UPLOAD PDF " + new Date());
  var reader = new FileReader();
  reader.onload = function() {
    console.log("READER DONE IN UPLOAD PDF " + new Date());
    var data = {
      pkey: this.pkey,
      vnum: this.vnum,
      arrayBuffer: reader.result
    };
    window.freedom.emit('add-pdf', data);
  }.bind(this);
  reader.readAsArrayBuffer(file);
};

Version.prototype.shareVersion = function(){
//maybe have this delete reviews as well?
  freedom.emit('share-version', this);
};

Version.prototype.editComments = function(comments) {
  this.comments = comments; 
};

Version.prototype.editPrivacy = function(publicSetting) {
  console.log("EDIT PRIVACY " + publicSetting);
  if (publicSetting){
    this.viewList = false; 
    this.privateSetting = false; 
  }
  else {
    this.viewList = this.alertList; 
    this.privateSetting = true; 
  }

  var msg = {
    title: this.title,
    author: this.author,
    vnum: this.vnum,
    privateSetting : this.privateSetting,
    pkey : this.pkey,
    action : 'edit-privacy'
  };
  window.freedom.emit('edit-privacy', msg);
};

window.freedom.on('got-pdf', function(ab){
  console.log("GOT PDF DATE " + new Date());
  console.log('gotpdf');
  var blob = new Blob([ab], {type:'application/pdf'});
  console.log("DOWNLOAD TITLE: " + this.title);
  saveAs(blob, this.title);
  console.log("END DATE " + new Date());
});

Version.prototype.download = function(){
  console.log("DOWNLOAD DATE " + new Date());
  var data = {
    pkey: this.pkey,
    vnum: this.vnum
  };
  if(username != this.author) { 
    data.author = this.author;  
  }
  window.freedom.emit('download-pdf', data);
};
