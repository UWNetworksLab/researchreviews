function toSignup() {
  console.log("sign up page");
  showPage("signup-page");
}

function signup() {
  var form = document.getElementsByTagName('form')[1];
  var newUser = {
    user: form.user.value,
    password: form.password.value,
    action: "signup"
  };
  console.log("newUser " + form.user.value + " " + form.password.value); 
  parent.postMessage(newUser, '*');
  console.log("sign up");  
}

function login() {
  var form = document.getElementsByTagName('form')[0];
  var credentials = {
      user: form.user.value,
      password: form.password.value,
      action: 'login'
  };
  parent.postMessage(credentials, '*');
}

function showPage(id) {
  console.log("show page: " + id);
  var pg = document.getElementById(id);
  if (!pg) {
    alert("no such page");
    return;
  }

  // get all pages, loop through them and hide them
  var pages = document.getElementsByClassName('page');
  for(var i = 0; i < pages.length; i++) 
      pages[i].style.display = 'none';

  if(id === "papers-page") {
    window.freedom.emit('load-papers', 0);
  }

  pg.style.display = 'block';
}

window.onload = function() {
  showPage("login-page");

  window.addEventListener('message', function(m) {
    document.getElementById('status').innerText = m.data;
  }, true);
} 