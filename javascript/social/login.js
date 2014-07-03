window.addEventListener('load', function() {
  var form = document.getElementsByTagName('form')[0];
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var credentials = {
      user: form.user.value,
      password: form.password.value,
    };
    parent.postMessage(credentials, '*');
    return false;
  }, true);
  
  window.addEventListener('message', function(m) {
    document.getElementById('status').innerText = m.data;
  }, true);
}, true);