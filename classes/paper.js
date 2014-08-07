function Paper(file, viewList, alertList, privateSetting, comments) {
  console.log("IN PAPER CONSTRUCTOR");
  this.pkey = Math.random() + ""; 
  this.versions = [];
  this.author = username;

  var vData = {
    vnum: 0,
    author: username,
    comments: comments,
    pkey: this.pkey,
    viewList: viewList,
    alertList: alertList, 
    privateSetting: privateSetting
  };

  var reader = new FileReader();
  reader.onload = function(vData) {
    var arrayBuffer = reader.result;
    vData.title = file.name;
    vData.binaryString = ab2str(arrayBuffer);
    var version = new Version(vData);
    this.versions.push(version);
    window.freedom.emit('add-paper', this);

  }.bind(this, vData);
  reader.readAsArrayBuffer(file);
}

Paper.prototype.addVersion = function(version) {
  this.versions.push(version);
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