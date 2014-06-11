//backend

var store = freedom.localstorage(); 

freedom.on('switch-dashboard', function(data) {
  if(data=='submitter')
    freedom.emit('to-submitter', ''); 
  else if(data=='reviewer')
    freedom.emit('to-reviewer', '');
});


