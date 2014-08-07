function Version(vdata) {
  console.log("IN VERSION CONSTRUCTOR");
  this.vnum = vdata.vnum;
  this.author = vdata.author;
  this.comments = vdata.comments;
  this.pkey = vdata.pkey;
  this.viewList = vdata.viewList;
  this.alertList = vdata.alertList;
  this.privateSetting = vdata.privateSetting;
  this.binaryString = vdata.binaryString;
  this.title = vdata.title;
  
  this.reviews = {};
  this.date = new Date();
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