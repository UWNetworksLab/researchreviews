function Version(vdata, file, paper) {
  this.comments = vdata.comments;
  this.viewList = vdata.viewList;
  this.alertList = vdata.alertList;
  this.privateSetting = vdata.privateSetting;

  this.reviews = vdata.reviews? vdata.reviews : [];
  this.date = new Date();

  this.author = vdata.author;
  this.pkey = vdata.pkey;
  this.vnum = vdata.vnum; 

  this.binaryString = vdata.binaryString;
  this.title = vdata.title;

  if (file){
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
}

Version.prototype.addReview = function(rkey, reviewer) {
  reviews[rkey] = reviewer;
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
  var ab = str2ab(this.binaryString);
  var reader = new FileReader();
  var blob = new Blob([ab], {type:'application/pdf'});

  reader.readAsArrayBuffer(blob);
  saveAs(blob, this.title);
};