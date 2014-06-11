//interactions
window.onload = function() {

  var sbutton = document.getElementById('sbutton'); 
  var rbutton = document.getElementById('rbutton');

  var addpaper;
  var n_addpaper = 0; 

  window.freedom.emit('switch-dashboard', 'submitter');

  sbutton.onclick = function() {
    console.log("clicked submitter"); 
    window.freedom.emit('switch-dashboard', 'submitter'); 
  } 

  rbutton.onclick = function() {
    console.log("clicked reviewer");
    window.freedom.emit('switch-dashboard', 'reviewer'); 
  };

  window.freedom.on('to-submitter', function(data) {
    n_addpaper++; 
    if(n_addpaper == 1) {
      addpaper = document.createElement('BUTTON');
      addpaper.appendChild(document.createTextNode('add paper'));
      main.appendChild(addpaper); 
    }

    document.getElementById('d-title').innerHTML = 'my papers'; 
  }); 

  window.freedom.on('to-reviewer', function(data) {
    if(n_addpaper > 0) {
      main.removeChild(addpaper); 
      addpaper = null;   
    }
    n_addpaper = 0; 

    document.getElementById('d-title').innerHTML = 'my reviews'; 
  }); 

};
  