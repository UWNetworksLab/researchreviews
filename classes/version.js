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
  this.ptitle = vdata.ptitle;  
}

Version.prototype.addReview = function(rkey, reviewer) {
  reviews[rkey] = reviewer;
};

Version.prototype.uploadPDF = function(file){
  console.log("IN PDF");
  var reader = new FileReader();
  reader.onload = function() {
    var data = {
      pkey: this.pkey,
      vnum: this.vnum,
      arrayBuffer: reader.result
    };
    console.log("TYEP OF " + data.arrayBuffer.byteLength);
    window.freedom.emit('add-pdf', data);
  }.bind(this);
  reader.readAsArrayBuffer(file);
};

Version.prototype.shareVersion = function(){
  freedom.emit('share-version', this);
};

Version.prototype.editPrivacy = function(publicSetting) {
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

  console.log("msg " + JSON.stringify(msg));
  window.freedom.emit('edit-privacy', JSON.stringify(msg)); 
};

Version.prototype.download = function(){
  var data = {
    pkey: this.pkey,
    vnum: this.vnum
  };
  window.freedom.emit('download-pdf', data);
  
  window.freedom.on('got-pdf', function(ab){
    console.log('gotpdf');
    var reader = new FileReader();
    var blob = new Blob([ab], {type:'application/pdf'});
    reader.readAsArrayBuffer(blob);
    saveAs(blob, this.title);
  });
};
